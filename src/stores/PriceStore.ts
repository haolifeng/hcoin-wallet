import { makeAutoObservable, runInAction } from 'mobx';
import { COINGECKO_IDS, FALLBACK_PRICES } from '../constants/prices';

const API_BASE = 'https://api.coingecko.com/api/v3/simple/price';

/**
 * 币种美元价格。
 * 启动后尝试从 CoinGecko 拉取实时价格；网络不可用时保留兜底价格，保证总览始终可用。
 */
class PriceStore {
  /** 币种符号 → 美元价格 */
  prices: Record<string, number> = { ...FALLBACK_PRICES };
  loading = false;
  /** 上次成功更新价格的时间戳（毫秒），null 表示仍在用兜底价格 */
  updatedAt: number | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 读取某币种价格，未知币种返回 0 */
  getPrice(symbol: string): number {
    return this.prices[symbol] ?? 0;
  }

  /** 拉取实时价格；失败时静默保留上一次的价格 */
  async refresh(): Promise<void> {
    const symbols = Object.keys(COINGECKO_IDS);
    const ids = symbols.map((symbol) => COINGECKO_IDS[symbol]).join(',');
    const url = `${API_BASE}?ids=${ids}&vs_currencies=usd`;

    this.loading = true;
    try {
      // 超时保护：行情接口不可用时不应让请求悬挂
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Record<string, { usd?: number }>;
      runInAction(() => {
        const next = { ...this.prices };
        for (const symbol of symbols) {
          const price = data[COINGECKO_IDS[symbol]]?.usd;
          if (typeof price === 'number' && price > 0) next[symbol] = price;
        }
        this.prices = next;
        this.updatedAt = Date.now();
        this.loading = false;
      });
    } catch {
      runInAction(() => {
        this.loading = false;
      });
    }
  }
}

export const priceStore = new PriceStore();
