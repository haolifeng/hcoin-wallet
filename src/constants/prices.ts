/** 各币种的兜底美元价格：网络不可用（例如内网 / 无外网）时使用 */
export const FALLBACK_PRICES: Record<string, number> = {
  BTC: 65000,
  ETH: 3200,
  AVAX: 35,
  SOL: 150,
  USDT: 1,
  USDC: 1,
};

/** 币种符号 → CoinGecko 资产 id（用于拉取实时价格） */
export const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  AVAX: 'avalanche-2',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
};
