import { makeAutoObservable, runInAction } from 'mobx';
import {
  DEFAULT_NETWORK,
  NETWORK_LABEL,
  NETWORK_STORAGE_KEY,
  isNetworkType,
  type NetworkType,
} from '../constants/network';
import { startupStore } from './StartupStore';

/**
 * 网络环境（主网 / 测试网）全局状态。
 * 真值由主进程持久化（userData/network.json），此处仅负责同步与切换：
 * 切换后刷新账户地址（BTC 主网 / 测试网地址不同）与各链余额。
 */
class NetworkStore {
  network: NetworkType = DEFAULT_NETWORK;
  /** 切换中（等待主进程完成切换与重新轮询） */
  switching = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 是否为主网 */
  get isMainnet(): boolean {
    return this.network === 'mainnet';
  }

  /** 当前网络环境的展示名 */
  get label(): string {
    return NETWORK_LABEL[this.network];
  }

  /** 应用启动：以主进程持久化的网络为准，非 Electron 环境回落到本地缓存 */
  async init(): Promise<void> {
    const cached = this.readCache();
    if (cached) {
      runInAction(() => {
        this.network = cached;
      });
    }

    const api = window.walletAPI;
    if (!api?.getNetwork) return;

    // 渲染进程可能早于主进程注册 IPC 处理器，失败时重试几次
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const network = await api.getNetwork();
        if (isNetworkType(network)) {
          runInAction(() => {
            this.network = network;
          });
          this.writeCache(network);
        }
        return;
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
    }
    // 读取失败保留本地缓存值，不阻塞启动
  }

  /**
   * 切换网络环境：通知主进程 → 更新本地状态 → 刷新账户地址与余额。
   * 失败时回滚到切换前的网络并抛出错误，由调用方提示。
   */
  async setNetwork(network: NetworkType): Promise<void> {
    if (network === this.network || this.switching) return;

    const previous = this.network;
    runInAction(() => {
      this.switching = true;
      this.error = null;
    });

    try {
      const api = window.walletAPI;
      let account = null;
      if (api?.setNetwork) {
        const result = await api.setNetwork(network);
        account = result?.account ?? null;
      }
      runInAction(() => {
        this.network = network;
        this.switching = false;
        // BTC 主网 / 测试网派生路径不同，地址随网络变化
        if (account) startupStore.setAccount(account);
      });
      this.writeCache(network);
      void startupStore.refreshBalances();
    } catch (err) {
      runInAction(() => {
        this.network = previous;
        this.switching = false;
        this.error = err instanceof Error ? err.message : '切换网络失败';
      });
      throw err;
    }
  }

  private readCache(): NetworkType | null {
    try {
      const raw = window.localStorage.getItem(NETWORK_STORAGE_KEY);
      return isNetworkType(raw) ? raw : null;
    } catch {
      return null;
    }
  }

  private writeCache(network: NetworkType): void {
    try {
      window.localStorage.setItem(NETWORK_STORAGE_KEY, network);
    } catch {
      // 隐私模式下 localStorage 可能不可用，忽略
    }
  }
}

export const networkStore = new NetworkStore();
