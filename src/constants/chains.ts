/** 前端展示用的链配置（与主进程 chains.ts 保持一致） */
import type { UnlockResult } from '../types/global';
import type { NetworkType } from './network';

export interface ChainDisplay {
  /** 链 key，如 'eth' / 'avax' / 'btc' */
  key: string;
  /** 链类型：区分 EVM / BTC / Solana 的处理与展示 */
  kind: 'evm' | 'bitcoin' | 'solana';
  /** 网络名称，随网络环境变化，如 'Sepolia' / 'Ethereum' */
  name: string;
  /** 原生代币符号，如 'ETH' / 'AVAX' / 'BTC' */
  nativeSymbol: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
  /** 追加在交易哈希之后的查询参数（如 Solana devnet 的 ?cluster=devnet） */
  explorerTxSuffix?: string;
  /** 该链展示的 ERC-20 代币符号（BTC 无代币，空数组） */
  tokens: string[];
}

/** 一条链在某个网络环境下的展示配置 */
interface ChainNetworkDisplay {
  name: string;
  explorerTxUrl: string;
  explorerTxSuffix?: string;
  tokens: string[];
}

/** 一条链的定义：与网络无关的部分 + 主网 / 测试网各自的展示配置 */
interface ChainDef {
  key: string;
  kind: 'evm' | 'bitcoin' | 'solana';
  nativeSymbol: string;
  networks: Record<NetworkType, ChainNetworkDisplay>;
}

const CHAIN_DEFS: ChainDef[] = [
  {
    key: 'eth',
    kind: 'evm',
    nativeSymbol: 'ETH',
    networks: {
      mainnet: {
        name: 'Ethereum',
        explorerTxUrl: 'https://etherscan.io/tx/',
        tokens: ['USDT', 'USDC'],
      },
      testnet: {
        name: 'Sepolia',
        explorerTxUrl: 'https://sepolia.etherscan.io/tx/',
        tokens: ['USDT', 'USDC'],
      },
    },
  },
  {
    key: 'avax',
    kind: 'evm',
    nativeSymbol: 'AVAX',
    networks: {
      mainnet: {
        name: 'Avalanche',
        explorerTxUrl: 'https://snowtrace.io/tx/',
        tokens: ['USDT', 'USDC'],
      },
      testnet: {
        name: 'Fuji',
        explorerTxUrl: 'https://testnet.snowtrace.io/tx/',
        tokens: ['USDT', 'USDC'],
      },
    },
  },
  {
    key: 'btc',
    kind: 'bitcoin',
    nativeSymbol: 'BTC',
    networks: {
      mainnet: { name: 'Bitcoin', explorerTxUrl: 'https://mempool.space/tx/', tokens: [] },
      testnet: {
        name: 'Bitcoin Testnet',
        explorerTxUrl: 'https://mempool.space/testnet/tx/',
        tokens: [],
      },
    },
  },
  {
    key: 'sol',
    kind: 'solana',
    nativeSymbol: 'SOL',
    networks: {
      mainnet: { name: 'Solana', explorerTxUrl: 'https://explorer.solana.com/tx/', tokens: [] },
      testnet: {
        name: 'Solana Devnet',
        explorerTxUrl: 'https://explorer.solana.com/tx/',
        explorerTxSuffix: '?cluster=devnet',
        tokens: [],
      },
    },
  },
];

/** 当前网络环境下的全部链（顺序：ETH / AVAX / BTC / SOL） */
export function getChains(network: NetworkType): ChainDisplay[] {
  return CHAIN_DEFS.map((def) => {
    const net = def.networks[network];
    return {
      key: def.key,
      kind: def.kind,
      nativeSymbol: def.nativeSymbol,
      name: net.name,
      explorerTxUrl: net.explorerTxUrl,
      explorerTxSuffix: net.explorerTxSuffix,
      tokens: net.tokens,
    };
  });
}

/** 当前网络环境下某条链的展示配置 */
export function getChainDisplay(
  chainKey: string,
  network: NetworkType,
): ChainDisplay | undefined {
  return getChains(network).find((c) => c.key === chainKey);
}

/** 发送资产选项的值格式：`<chainKey>:<symbol>` */
export function buildAssetValue(chainKey: string, symbol: string): string {
  return `${chainKey}:${symbol}`;
}

/**
 * 取账户在指定链上的收发地址：
 * EVM 链（ETH / AVAX）共用 ethAddress，BTC / SOL 使用各自独立地址。
 * BTC 地址由主进程按当前网络环境派生（主网 bc1… / 测试网 tb1…）。
 */
export function resolveChainAddress(
  chain: ChainDisplay,
  account: Pick<UnlockResult, 'ethAddress' | 'btcAddress' | 'solAddress'>,
): string {
  if (chain.kind === 'bitcoin') return account.btcAddress;
  if (chain.kind === 'solana') return account.solAddress;
  return account.ethAddress;
}

/** 可发送的资产选项（按链分组，随网络环境变化） */
export function getSendAssetOptions(network: NetworkType): {
  value: string;
  label: string;
}[] {
  return getChains(network).flatMap((chain) =>
    [chain.nativeSymbol, ...chain.tokens].map((symbol) => ({
      value: buildAssetValue(chain.key, symbol),
      label: `${symbol} · ${chain.name}`,
    })),
  );
}

/** 拼接区块浏览器交易链接（devnet 等需要额外查询参数） */
export function buildExplorerTxUrl(
  chain: ChainDisplay | undefined,
  txHash: string,
): string {
  if (!chain) return '';
  return `${chain.explorerTxUrl}${txHash}${chain.explorerTxSuffix ?? ''}`;
}
