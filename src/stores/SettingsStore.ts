import { makeAutoObservable, runInAction } from 'mobx';

export interface AccountBrief {
  address: string;
  createdAt: number;
  /** 是否存有加密助记词（演示账户没有，不能备份） */
  hasSecret: boolean;
}

class SettingsStore {
  /** 设置弹窗 */
  settingsVisible = false;
  /** 备份弹窗 */
  backupVisible = false;
  accounts: AccountBrief[] = [];
  selectedAddress: string | null = null;
  password = '';
  loading = false;
  error: string | null = null;
  /** 解密后的助记词，仅存于内存，弹窗关闭即清空 */
  mnemonic: string[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  openSettings(): void {
    this.settingsVisible = true;
  }

  closeSettings(): void {
    this.settingsVisible = false;
  }

  /** 进入备份流程：关闭设置弹窗，打开备份弹窗并加载账户列表 */
  async openBackup(): Promise<void> {
    this.settingsVisible = false;
    this.backupVisible = true;
    this.password = '';
    this.mnemonic = [];
    this.error = null;
    await this.loadAccounts();
  }

  async loadAccounts(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const api = window.walletAPI;
      if (!api?.listAccounts) {
        throw new Error('当前环境不支持备份（未检测到 Electron 接口）');
      }
      const accounts = await api.listAccounts();
      runInAction(() => {
        this.accounts = accounts;
        // 默认选中第一个「可备份」的账户，避免选到没有助记词的演示账户
        const backable = accounts.find((a) => a.hasSecret);
        this.selectedAddress = backable?.address ?? accounts[0]?.address ?? null;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '读取账户列表失败';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  setSelectedAddress(address: string): void {
    this.selectedAddress = address;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  /** 用密码解密所选账户的助记词 */
  async submitBackup(): Promise<void> {
    if (!this.selectedAddress) throw new Error('请选择要备份的账户');
    if (!this.password) throw new Error('请输入密码');

    this.loading = true;
    this.error = null;
    try {
      const api = window.walletAPI;
      if (!api?.backupMnemonic) {
        throw new Error('当前环境不支持备份（未检测到 Electron 接口）');
      }
      const phrase = await api.backupMnemonic(this.selectedAddress, this.password);
      runInAction(() => {
        this.mnemonic = phrase.split(' ');
        this.password = ''; // 解密成功后立即丢弃内存中的密码
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '备份失败';
        this.loading = false;
      });
      throw err;
    }
  }

  closeBackup(): void {
    this.backupVisible = false;
    this.accounts = [];
    this.selectedAddress = null;
    this.password = '';
    this.mnemonic = [];
    this.error = null;
    this.loading = false;
  }
}

export const settingsStore = new SettingsStore();
