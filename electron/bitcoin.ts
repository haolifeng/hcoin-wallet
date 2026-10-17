import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { mnemonicToSeedSync } from 'bip39';

/** BIP84 Native SegWit 主网派生路径 */
export const BTC_DERIVE_PATH = "m/84'/0'/0'/0/0";
/** 网络名称 */
export const BTC_NETWORK_NAME = 'Bitcoin';
/**
 * 主网 REST API（mempool.space），用于查询余额、UTXO、费率与广播。
 * 可通过环境变量 BTC_API_BASE_URL 覆盖为自建/私有服务。
 */
export const BTC_API_BASE = process.env.BTC_API_BASE_URL ?? 'https://mempool.space/api';
/** 区块浏览器交易地址前缀 */
export const BTC_EXPLORER_TX_URL = 'https://mempool.space/tx/';

/** P2WPKH 灰尘阈值（sats） */
const DUST_LIMIT = 546n;
const SATS_PER_BTC = 100_000_000n;

/** 由助记词派生的 BTC 账户（私钥仅存于主进程内存） */
export interface BtcAccount {
  /** 主网 Native SegWit 地址（bc1q…） */
  address: string;
  /** BIP84 派生路径 */
  path: string;
  /** 压缩公钥（33 字节） */
  publicKey: Uint8Array;
  /** 私钥（32 字节），绝不落盘、绝不回传渲染进程 */
  privateKey: Uint8Array;
}

/**
 * 由 BIP39 助记词派生 BTC 主网账户（m/84'/0'/0'/0/0）。
 * 明文助记词只在本次调用内用于派生种子，派生完成即随函数返回被回收。
 */
export function deriveBtcAccount(mnemonic: string): BtcAccount {
  const seed = mnemonicToSeedSync(mnemonic.trim().toLowerCase());
  const child = HDKey.fromMasterSeed(seed).derive(BTC_DERIVE_PATH);
  if (!child.publicKey || !child.privateKey) {
    throw new Error('BTC 账户派生失败');
  }
  const payment = btc.p2wpkh(child.publicKey, btc.NETWORK);
  if (!payment.address) {
    throw new Error('BTC 地址生成失败');
  }
  return {
    address: payment.address,
    path: BTC_DERIVE_PATH,
    publicKey: child.publicKey,
    privateKey: child.privateKey,
  };
}

/** 校验 BTC 主网地址是否合法 */
export function isValidBtcAddress(address: string): boolean {
  try {
    btc.Address(btc.NETWORK).decode(address);
    return true;
  } catch {
    return false;
  }
}

/** BTC 数量字符串 → sats（BigInt），避免浮点误差 */
export function btcToSats(amount: string): bigint {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error('发送数量格式不正确');
  }
  const [intPart, fracPart = ''] = trimmed.split('.');
  const frac = `${fracPart}00000000`.slice(0, 8);
  return BigInt(intPart) * SATS_PER_BTC + BigInt(frac);
}

/** sats → BTC 数值（仅用于界面展示） */
function satsToBtc(sats: bigint): number {
  return Number(sats) / Number(SATS_PER_BTC);
}

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BTC_API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`BTC API 请求失败：${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

interface AddressStats {
  chain_stats: { funded_txo_sum: number; spent_txo_sum: number };
  mempool_stats: { funded_txo_sum: number; spent_txo_sum: number };
}

interface ApiUtxo {
  txid: string;
  vout: number;
  value: number;
  status: { confirmed: boolean };
}

interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
}

/**
 * 查询主网上某个 BTC 地址的余额，返回以 BTC 为单位的数值。
 * 余额 = （链上已收 − 已花）+（内存池已收 − 已花）。
 */
export async function fetchBtcBalance(address: string): Promise<number> {
  const stats = await apiGet<AddressStats>(`/address/${address}`);
  const chain = stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum;
  const mempool = stats.mempool_stats.funded_txo_sum - stats.mempool_stats.spent_txo_sum;
  return satsToBtc(BigInt(chain + mempool));
}

/** 获取建议费率（sat/vB），取半小时确认档作为折中 */
async function fetchFeeRate(): Promise<number> {
  const fees = await apiGet<RecommendedFees>('/v1/fees/recommended');
  return Math.max(1, fees.halfHourFee || fees.fastestFee || 1);
}

/**
 * 发送 BTC：取 UTXO → 评估费率 → 贪心选币 → 构造/签名 P2WPKH 交易 → 广播。
 * 找零低于灰尘阈值时并入手续费。返回交易哈希（txid）。
 */
export async function sendBtc(account: BtcAccount, to: string, amount: string): Promise<string> {
  const toAddress = to.trim();
  if (!isValidBtcAddress(toAddress)) {
    throw new Error('无效的 BTC 收款地址');
  }
  const sendSats = btcToSats(amount);
  if (sendSats <= 0n) {
    throw new Error('请输入有效的发送数量');
  }

  const payment = btc.p2wpkh(account.publicKey, btc.NETWORK);
  const feeRate = await fetchFeeRate();
  const rawUtxos = await apiGet<ApiUtxo[]>(`/address/${account.address}/utxo`);
  if (rawUtxos.length === 0) {
    throw new Error('可用余额为 0，无法发送');
  }

  // 优先使用大额 UTXO，减少输入数量
  const utxos = rawUtxos
    .map((u) => ({ txid: u.txid, index: u.vout, value: BigInt(u.value) }))
    .sort((a, b) => (b.value > a.value ? 1 : b.value < a.value ? -1 : 0));

  // vsize 估算：固定开销 10 + P2WPKH 输入 ~68 + 输出 ~31（收款 + 找零）
  const estimateVsize = (inCount: number, outCount: number) => 10 + inCount * 68 + outCount * 31;

  const selected: { txid: string; index: number; value: bigint }[] = [];
  let total = 0n;
  for (const utxo of utxos) {
    selected.push(utxo);
    total += utxo.value;
    const feeWithChange = BigInt(Math.ceil(estimateVsize(selected.length, 2) * feeRate));
    if (total >= sendSats + feeWithChange) break;
  }

  const fee = BigInt(Math.ceil(estimateVsize(selected.length, 2) * feeRate));
  if (total < sendSats + fee) {
    throw new Error('余额不足以支付发送数量与手续费');
  }

  const change = total - sendSats - fee;

  const tx = new btc.Transaction();
  for (const utxo of selected) {
    tx.addInput({
      txid: utxo.txid,
      index: utxo.index,
      witnessUtxo: { script: payment.script, amount: utxo.value },
    });
  }
  tx.addOutputAddress(toAddress, sendSats, btc.NETWORK);
  if (change > DUST_LIMIT) {
    tx.addOutputAddress(account.address, change, btc.NETWORK);
  }
  tx.sign(account.privateKey);
  tx.finalize();

  const res = await fetch(`${BTC_API_BASE}/tx`, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: tx.hex,
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`广播失败：${res.status} ${detail}`.trim());
  }
  const txid = (await res.text()).trim();
  return txid || tx.id;
}
