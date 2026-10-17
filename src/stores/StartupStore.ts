import { makeAutoObservable, runInAction } from 'mobx';
import { menuStore } from './MenuStore';
import { createWalletStore } from './CreateWalletStore';
import { importWalletStore } from './ImportWalletStore';
import type { AccountBrief } from './SettingsStore';
import type { UnlockResult } from '../types/global';

/**
 * 启动流程阶段：
 * - checking：正在检测本地数据库是否已有助记词
 * - choose  ：无助记词，让用户选择「创建」还是「导入」
 * - create  ：无助记词，弹窗引导创建（与「创建」按钮同一套逻辑）
 * - import  ：无助记词，弹窗引导导入已有 12 词助记词
 * - unlock  ：已有助记词，弹窗输入密码解锁
 * - ready   ：已完成，进入主界面
 */
export type StartupPhase =
  | 'checking'
  | 'choose'
  | 'create'
  | 'import'
  | 'unlock'
  | 'ready';

class StartupStore {
  phase: StartupPhase = 'checking';
  /** 持有加密助记词、可被解锁的账户 */
  accounts: AccountBrief[] = [];
  selectedAddress: string | null = null;
  /** 解锁密码，仅存于内存，解锁成功即清空 */
  password = '';
  loading = false;
  error: string | null = null;
  /** 当前会话已解锁的账户（钱包地址 + ETH 地址） */
  account: UnlockResult | null = null;
  /** 当前账户的 ETH 余额（由前台轮询数据库更新） */
  ethBalance: number | null = null;
  /** 当前账户的各 ERC-20 代币余额（symbol → 数值），由前台轮询数据库更新 */
  tokenBalances: Record<string, number> = {};
  /** 余额轮询加载状态（首次加载时可展示 loading） */
  balanceLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get unlocked(): boolean {
    return this.account !== null;
  }

  /** 应用启动：检测数据库 → 决定「创建」还是「解锁」 */
  async init(): Promise<void> {
    const api = window.walletAPI;
    if (!api?.hasMnemonic) {
      // 非 Electron 环境（例如 vite dev 的浏览器预览）：不做启动拦截
      runInAction(() => {
        this.phase = 'ready';
      });
      return;
    }

    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const state = await api.hasMnemonic();
      if (!state.exists) {
        // 数据库中没有助记词：先让用户选择「创建」还是「导入」
        runInAction(() => {
          this.phase = 'choose';
        });
        return;
      }

      const accounts = (await api.listAccounts()).filter((a) => a.hasSecret);
      runInAction(() => {
        this.accounts = accounts;
        this.selectedAddress = state.address ?? accounts[0]?.address ?? null;
        this.phase = 'unlock';
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '启动检测失败';
        // 检测失败不阻塞进入主界面，用户仍可在界面上手动创建
        this.phase = 'ready';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /** 启动选择：创建新的助记词（复用「创建」按钮的向导逻辑，不可取消） */
  async chooseCreate(): Promise<void> {
    runInAction(() => {
      this.phase = 'create';
    });
    await createWalletStore.open(true);
  }

  /** 启动选择：导入已有的 12 词助记词 */
  chooseImport(): void {
    runInAction(() => {
      this.phase = 'import';
    });
    importWalletStore.open(true);
  }

  setPassword(value: string): void {
    this.password = value;
  }

  setSelectedAddress(address: string): void {
    this.selectedAddress = address;
  }

  /** 密码解锁：主进程解密助记词并派生 ETH 账户，此处只接收两个地址 */
  async unlock(): Promise<UnlockResult> {
    const api = window.walletAPI;
    if (!api?.unlockWallet) {
      throw new Error('当前环境不支持解锁（未检测到 Electron 接口）');
    }
    if (!this.selectedAddress) throw new Error('请选择要解锁的账户');
    if (!this.password) throw new Error('请输入密码');

    this.loading = true;
    this.error = null;
    try {
      const result = await api.unlockWallet(this.selectedAddress, this.password);
      runInAction(() => {
        this.account = result;
        this.password = ''; // 解锁成功后立即丢弃内存中的密码
        this.phase = 'ready';
        this.loading = false;
      });
      void menuStore.loadData();
      return result;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '解锁失败';
        this.loading = false;
      });
      throw err;
    }
  }

  /** 启动阶段完成创建：记录账户并放行进入主界面 */
  markCreated(result: UnlockResult): void {
    runInAction(() => {
      this.account = result;
      this.phase = 'ready';
      this.error = null;
    });
    void menuStore.loadData();
  }

  /**
   * 轮询读取当前账户的 ETH 与 ERC-20 代币余额：通过 IPC 查询主进程数据库。
   * 未解锁、非 Electron 环境或查询失败时静默跳过，保留上一次的值。
   */
  async refreshBalances(): Promise<void> {
    const address = this.account?.address;
    const api = window.walletAPI;
    if (!address || !api?.getEthBalance) return;
    try {
      const [ethBalance, tokenBalances] = await Promise.all([
        api.getEthBalance(address),
        api.getTokenBalances?.(address) ?? Promise.resolve({}),
      ]);
      runInAction(() => {
        this.ethBalance = ethBalance;
        this.tokenBalances = tokenBalances;
        this.balanceLoading = false;
      });
    } catch {
      // 轮询失败不打扰用户，等待下一次轮询
      runInAction(() => {
        this.balanceLoading = false;
      });
    }
  }
}

export const startupStore = new StartupStore();
