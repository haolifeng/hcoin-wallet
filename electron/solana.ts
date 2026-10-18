import { createHmac } from 'node:crypto';
import { mnemonicToSeedSync } from 'bip39';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getNetwork, type NetworkType } from './network';
import { t } from './locale';

/** BIP44（SLIP-0010 Ed25519）派生路径，与 Phantom 等主流钱包一致（主网 / 测试网共用） */
export const SOL_DERIVE_PATH = "m/44'/501'/0'/0'";

/** 某个网络环境下的 Solana 配置 */
export interface SolNetworkConfig {
  /** 网络名称 */
  name: string;
  /** JSON-RPC 节点 */
  rpcUrl: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
  /** 追加在交易哈希之后的查询参数（devnet 需要 ?cluster=devnet） */
  explorerTxSuffix?: string;
}

/**
 * 主网配置。官方 api.mainnet-beta.solana.com 常被限流/不可达，
 * 默认使用 publicnode，可通过环境变量 SOL_RPC_URL 覆盖。
 */
const SOL_MAINNET_CONFIG: SolNetworkConfig = {
  name: 'Solana',
  rpcUrl: process.env.SOL_RPC_URL ?? 'https://solana-rpc.publicnode.com',
  explorerTxUrl: 'https://explorer.solana.com/tx/',
};

/** 测试网（Devnet）配置，可通过环境变量 SOL_DEVNET_RPC_URL 覆盖 */
const SOL_TESTNET_CONFIG: SolNetworkConfig = {
  name: 'Solana Devnet',
  rpcUrl: process.env.SOL_DEVNET_RPC_URL ?? 'https://api.devnet.solana.com',
  explorerTxUrl: 'https://explorer.solana.com/tx/',
  explorerTxSuffix: '?cluster=devnet',
};

/** 按网络环境取 Solana 配置（默认取当前网络） */
export function getSolNetworkConfig(network: NetworkType = getNetwork()): SolNetworkConfig {
  return network === 'mainnet' ? SOL_MAINNET_CONFIG : SOL_TESTNET_CONFIG;
}

const LAMPORTS_PER_SOL_BI = 1_000_000_000n;
/** 交易费预留（lamports），仅用于余额提示，不作为硬性校验 */
const HARDENED = 0x80000000;

/** 由助记词派生的 Solana 账户（私钥仅存于主进程内存） */
export interface SolAccount {
  /** base58 编码的公钥地址 */
  address: string;
  /** 派生路径 */
  path: string;
  /** 32 字节 Ed25519 私钥种子，绝不落盘、绝不回传渲染进程 */
  secretKey: Uint8Array;
}

/**
 * SLIP-0010 Ed25519 分层派生（Solana 路径全部为硬化索引）。
 * 返回 32 字节私钥种子；仅用 node:crypto 实现，避免额外依赖。
 */
function slip10Ed25519(seed: Uint8Array, indices: number[]): Uint8Array {
  const I = createHmac('sha512', Buffer.from('ed25519 seed')).update(seed).digest();
  let key: Uint8Array = I.subarray(0, 32);
  let chainCode: Uint8Array = I.subarray(32, 64);
  for (const index of indices) {
    const data = Buffer.concat([
      Buffer.from([0]),
      key,
      Buffer.from([
        (index >>> 24) & 0xff,
        (index >>> 16) & 0xff,
        (index >>> 8) & 0xff,
        index & 0xff,
      ]),
    ]);
    const h = createHmac('sha512', chainCode).update(data).digest();
    key = h.subarray(0, 32);
    chainCode = h.subarray(32, 64);
  }
  return Uint8Array.from(key);
}

/** 解析 "m/44'/501'/0'/0'" → 硬化索引数组 */
function parsePath(path: string): number[] {
  return path
    .replace(/^m\/?/, '')
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      const hardened = segment.endsWith("'");
      const index = Number(hardened ? segment.slice(0, -1) : segment);
      if (!Number.isInteger(index) || index < 0) {
        throw new Error(`非法的派生路径片段：${segment}`);
      }
      return hardened ? index + HARDENED : index;
    });
}

/**
 * 由 BIP39 助记词派生 Solana 主网账户（m/44'/501'/0'/0'）。
 * 明文助记词只在本次调用内用于派生种子，派生完成即随函数返回被回收。
 */
export function deriveSolAccount(mnemonic: string): SolAccount {
  const seed = mnemonicToSeedSync(mnemonic.trim().toLowerCase());
  const secretKey = slip10Ed25519(seed, parsePath(SOL_DERIVE_PATH));
  const keypair = Keypair.fromSeed(secretKey);
  return {
    address: keypair.publicKey.toBase58(),
    path: SOL_DERIVE_PATH,
    secretKey,
  };
}

/** 校验 Solana 主网地址（base58 且解码为 32 字节） */
export function isValidSolAddress(address: string): boolean {
  const trimmed = address.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  try {
    // PublicKey 构造函数在长度/字符非法时抛错
    return new PublicKey(trimmed).toBase58() === trimmed;
  } catch {
    return false;
  }
}

/** SOL 数量字符串 → lamports（整数），避免浮点误差 */
function solToLamports(amount: string): number {
  const trimmed = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(t('err.amountFormat'));
  }
  const [intPart, fracPart = ''] = trimmed.split('.');
  // 精度必须显式拒绝，不能静默截断
  if (fracPart.length > 9) {
    throw new Error(t('err.amountPrecision', { digits: 9 }));
  }
  const frac = fracPart.padEnd(9, '0');
  const lamports = BigInt(intPart) * LAMPORTS_PER_SOL_BI + BigInt(frac);
  if (lamports <= 0n) {
    throw new Error(t('err.amountPositive'));
  }
  return Number(lamports);
}

/** 每个网络环境各自的懒加载 Connection */
const connections = new Map<NetworkType, Connection>();

/** 懒加载单例 Connection（按网络环境缓存） */
function getConnection(network: NetworkType = getNetwork()): Connection {
  let connection = connections.get(network);
  if (!connection) {
    connection = new Connection(getSolNetworkConfig(network).rpcUrl, 'confirmed');
    connections.set(network, connection);
  }
  return connection;
}

/** 切换网络环境后释放全部 Connection，下次使用会按新网络重新建立 */
export function resetSolConnections(): void {
  connections.clear();
}

/**
 * 查询某个 Solana 地址的余额，返回以 SOL 为单位的数值（默认查当前网络环境）。
 * 注意：返回值为 number，仅用于界面展示。
 */
export async function fetchSolBalance(
  address: string,
  network: NetworkType = getNetwork(),
): Promise<number> {
  const lamports = await getConnection(network).getBalance(new PublicKey(address));
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * 发送 SOL：取最新 blockhash → 构造系统转账 → 签名 → 广播。返回交易签名（txid）。
 * 主网与测试网地址/私钥相同，仅 RPC 节点不同。
 */
export async function sendSol(
  secretKey: Uint8Array,
  to: string,
  amount: string,
  network: NetworkType = getNetwork(),
): Promise<string> {
  const toAddress = to.trim();
  if (!isValidSolAddress(toAddress)) {
    throw new Error(t('err.solAddressInvalid'));
  }
  const lamports = solToLamports(amount);

  const connectionInstance = getConnection(network);
  const keypair = Keypair.fromSeed(secretKey);
  const fromPubkey = keypair.publicKey;

  const balance = await connectionInstance.getBalance(fromPubkey);
  if (balance < lamports) {
    throw new Error(t('err.insufficient'));
  }

  const { blockhash } = await connectionInstance.getLatestBlockhash('confirmed');
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey,
      toPubkey: new PublicKey(toAddress),
      lamports,
    }),
  );
  tx.recentBlockhash = blockhash;
  tx.feePayer = fromPubkey;
  tx.sign(keypair);

  const signature = await connectionInstance.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    maxRetries: 3,
  });
  return signature;
}
