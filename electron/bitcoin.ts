import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';
import { mnemonicToSeedSync } from 'bip39';
import { getNetwork, type NetworkType } from './network';

/** BIP84 Native SegWit 主网派生路径 */
export const BTC_MAINNET_DERIVE_PATH = "m/84'/0'/0'/0/0";
/** BIP84 Native SegWit 测试网（Testnet3）派生路径 */
export const BTC_TESTNET_DERIVE_PATH = "m/84'/1'/0'/0/0";
/** 主网 REST API（mempool.space），可通过环境变量 BTC_API_BASE_URL 覆盖 */
export const BTC_MAINNET_API_BASE =
  process.env.BTC_API_BASE_URL ?? 'https://mempool.space/api';
/** 测试网 REST API（mempool.space/testnet），可通过环境变量 BTC_TESTNET_API_BASE_URL 覆盖 */
export const BTC_TESTNET_API_BASE =
  process.env.BTC_TESTNET_API_BASE_URL ?? 'https://mempool.space/testnet/api';

/** 某个网络环境下的 BTC 配置 */
export interface BtcNetworkConfig {
  /** 网络名称 */
  name: string;
  /** BIP84 派生路径（主网 coinType 0，测试网 coinType 1） */
  path: string;
  /** @scure/btc-signer 的网络参数（决定地址前缀 bc1 / tb1） */
  network: typeof btc.NETWORK;
  /** REST API 基址，用于查询余额、UTXO、费率与广播 */
  apiBase: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
}

/** 主网配置 */
const BTC_MAINNET_CONFIG: BtcNetworkConfig = {
  name: 'Bitcoin',
  path: BTC_MAINNET_DERIVE_PATH,
  network: btc.NETWORK,
  apiBase: BTC_MAINNET_API_BASE,
  explorerTxUrl: 'https://mempool.space/tx/',
};

/** 测试网（Testnet3）配置 */
const BTC_TESTNET_CONFIG: BtcNetworkConfig = {
  name: 'Bitcoin Testnet',
  path: BTC_TESTNET_DERIVE_PATH,
  network: btc.TEST_NETWORK,
  apiBase: BTC_TESTNET_API_BASE,
  explorerTxUrl: 'https://mempool.space/testnet/tx/',
};

/** 按网络环境取 BTC 配置（默认取当前网络） */
export function getBtcNetworkConfig(network: NetworkType = getNetwork()): BtcNetworkConfig {
  return network === 'mainnet' ? BTC_MAINNET_CONFIG : BTC_TESTNET_CONFIG;
}

/** P2WPKH 灰尘阈值（sats） */
const DUST_LIMIT = 546n;
const SATS_PER_BTC = 100_000_000n;

/** 由助记词派生的 BTC 账户（私钥仅存于主进程内存） */
export interface BtcAccount {
  /** Native SegWit 地址（主网 bc1q… / 测试网 tb1q…） */
  address: string;
  /** BIP84 派生路径（随网络环境变化） */
  path: string;
  /** 所属网络环境 */
  network: NetworkType;
  /** 压缩公钥（33 字节） */
  publicKey: Uint8Array;
  /** 私钥（32 字节），绝不落盘、绝不回传渲染进程 */
  privateKey: Uint8Array;
}

/**
 * 由 BIP39 助记词派生 BTC 账户（默认按当前网络环境的 BIP84 路径）。
 * 明文助记词只在本次调用内用于派生种子，派生完成即随函数返回被回收。
 */
export function deriveBtcAccount(
  mnemonic: string,
  network: NetworkType = getNetwork(),
): BtcAccount {
  const config = getBtcNetworkConfig(network);
  const seed = mnemonicToSeedSync(mnemonic.trim().toLowerCase());
  const child = HDKey.fromMasterSeed(seed).derive(config.path);
  if (!child.publicKey || !child.privateKey) {
    throw new Error('BTC 账户派生失败');
  }
  const payment = btc.p2wpkh(child.publicKey, config.network);
  if (!payment.address) {
    throw new Error('BTC 地址生成失败');
  }
  return {
    address: payment.address,
    path: config.path,
    network,
    publicKey: child.publicKey,
    privateKey: child.privateKey,
  };
}

/** 校验 BTC 地址是否合法（默认按当前网络环境） */
export function isValidBtcAddress(address: string, network: NetworkType = getNetwork()): boolean {
  try {
    btc.Address(getBtcNetworkConfig(network).network).decode(address);
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

async function apiGet<T>(apiBase: string, path: string): Promise<T> {
  const res = await fetch(`${apiBase}${path}`);
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
 * 查询某个 BTC 地址的余额，返回以 BTC 为单位的数值（默认查当前网络环境）。
 * 余额 = （链上已收 − 已花）+（内存池已收 − 已花）。
 */
export async function fetchBtcBalance(
  address: string,
  network: NetworkType = getNetwork(),
): Promise<number> {
  const { apiBase } = getBtcNetworkConfig(network);
  const stats = await apiGet<AddressStats>(apiBase, `/address/${address}`);
  const chain = stats.chain_stats.funded_txo_sum - stats.chain_stats.spent_txo_sum;
  const mempool = stats.mempool_stats.funded_txo_sum - stats.mempool_stats.spent_txo_sum;
  return satsToBtc(BigInt(chain + mempool));
}

/** 获取建议费率（sat/vB），取半小时确认档作为折中 */
async function fetchFeeRate(apiBase: string): Promise<number> {
  const fees = await apiGet<RecommendedFees>(apiBase, '/v1/fees/recommended');
  return Math.max(1, fees.halfHourFee || fees.fastestFee || 1);
}

/**
 * 发送 BTC：取 UTXO → 评估费率 → 贪心选币 → 构造/签名 P2WPKH 交易 → 广播。
 * 找零低于灰尘阈值时并入手续费。返回交易哈希（txid）。
 * 传入的账户已按网络环境派生，签名与广播均使用同一环境的参数。
 */
export async function sendBtc(
  account: BtcAccount,
  to: string,
  amount: string,
  network: NetworkType = account.network,
): Promise<string> {
  const config = getBtcNetworkConfig(network);
  const toAddress = to.trim();
  if (!isValidBtcAddress(toAddress, network)) {
    throw new Error('无效的 BTC 收款地址');
  }
  const sendSats = btcToSats(amount);
  if (sendSats <= 0n) {
    throw new Error('请输入有效的发送数量');
  }

  const payment = btc.p2wpkh(account.publicKey, config.network);
  const feeRate = await fetchFeeRate(config.apiBase);
  const rawUtxos = await apiGet<ApiUtxo[]>(config.apiBase, `/address/${account.address}/utxo`);
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
  tx.addOutputAddress(toAddress, sendSats, config.network);
  if (change > DUST_LIMIT) {
    tx.addOutputAddress(account.address, change, config.network);
  }
  tx.sign(account.privateKey);
  tx.finalize();

  const res = await fetch(`${config.apiBase}/tx`, {
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
