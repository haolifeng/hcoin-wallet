/** 前端展示用的链配置（与主进程 chains.ts 保持一致） */
export interface ChainDisplay {
  /** 链 key，如 'eth' / 'avax' / 'btc' */
  key: string;
  /** 链类型：区分 EVM / BTC / Solana 的处理与展示 */
  kind: 'evm' | 'bitcoin' | 'solana';
  /** 网络名称，如 'Sepolia' / 'Fuji' / 'Bitcoin' */
  name: string;
  /** 原生代币符号，如 'ETH' / 'AVAX' / 'BTC' */
  nativeSymbol: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
  /** 该链展示的 ERC-20 代币符号（BTC 无代币，空数组） */
  tokens: string[];
}

export const CHAINS: ChainDisplay[] = [
  {
    key: 'eth',
    kind: 'evm',
    name: 'Sepolia',
    nativeSymbol: 'ETH',
    explorerTxUrl: 'https://sepolia.etherscan.io/tx/',
    tokens: ['USDT', 'USDC'],
  },
  {
    key: 'avax',
    kind: 'evm',
    name: 'Fuji',
    nativeSymbol: 'AVAX',
    explorerTxUrl: 'https://testnet.snowtrace.io/tx/',
    tokens: ['USDT', 'USDC'],
  },
  {
    key: 'btc',
    kind: 'bitcoin',
    name: 'Bitcoin',
    nativeSymbol: 'BTC',
    explorerTxUrl: 'https://mempool.space/tx/',
    tokens: [],
  },
  {
    key: 'sol',
    kind: 'solana',
    name: 'Solana',
    nativeSymbol: 'SOL',
    explorerTxUrl: 'https://explorer.solana.com/tx/',
    tokens: [],
  },
];

/** 发送资产选项的值格式：`<chainKey>:<symbol>` */
export function buildAssetValue(chainKey: string, symbol: string): string {
  return `${chainKey}:${symbol}`;
}

/** 可发送的资产选项（按链分组） */
export const SEND_ASSET_OPTIONS = CHAINS.flatMap((chain) =>
  [chain.nativeSymbol, ...chain.tokens].map((symbol) => ({
    value: buildAssetValue(chain.key, symbol),
    label: `${symbol} · ${chain.name}`,
  })),
);
