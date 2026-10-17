import { makeAutoObservable, runInAction } from 'mobx';
import { validatePassword } from './CreateWalletStore';
import { localeStore } from './LocaleStore';
import type { UnlockResult } from '../types/global';

/** BIP39 12 词助记词 */
const WORD_COUNT = 12;

export type ImportStep = 1 | 2;

/**
 * 导入助记词向导：
 * 1）输入已有的 12 个助记词（主进程 BIP39 校验）
 * 2）设置密码 → 主进程加密后写入 LevelDB，并派生 ETH 账户
 */
class ImportWalletStore {
  visible = false;
  /** 启动流程中调用时为 true：弹窗不可取消 */
  startup = false;
  step: ImportStep = 1;
  /** 用户输入的原始文本（允许一次性粘贴 12 个单词） */
  phrase = '';
  /** 主进程校验结果：null 表示尚未校验 */
  valid: boolean | null = null;
  checking = false;
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 拆分后的单词（自动忽略多余空格/换行） */
  get words(): string[] {
    return this.phrase.trim().split(/\s+/).filter(Boolean);
  }

  get mnemonicPhrase(): string {
    return this.words.join(' ').toLowerCase();
  }

  get countOk(): boolean {
    return this.words.length === WORD_COUNT;
  }

  open(startup = false): void {
    this.reset();
    this.startup = startup;
    this.visible = true;
  }

  close(): void {
    this.visible = false;
    this.startup = false;
    this.reset();
  }

  setPhrase(value: string): void {
    this.phrase = value;
    // 内容变化后旧校验结果失效
    this.valid = null;
    this.error = null;
  }

  /** 第一步 → 第二步前，先交给主进程做 BIP39 校验 */
  async checkMnemonic(): Promise<boolean> {
    const api = window.walletAPI;
    if (!api?.validateMnemonic) {
      runInAction(() => {
        this.error = localeStore.t('err.envImport');
      });
      return false;
    }
    if (!this.countOk) {
      runInAction(() => {
        this.error = localeStore.t('err.wordCountMismatch', {
          total: WORD_COUNT,
          current: this.words.length,
        });
      });
      return false;
    }

    this.checking = true;
    this.error = null;
    try {
      const ok = await api.validateMnemonic(this.mnemonicPhrase);
      runInAction(() => {
        this.valid = ok;
        this.checking = false;
        if (!ok) this.error = localeStore.t('err.mnemonicInvalidInput');
      });
      return ok;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : localeStore.t('err.mnemonicCheckFailed');
        this.checking = false;
      });
      return false;
    }
  }

  async goSetPassword(): Promise<void> {
    if (await this.checkMnemonic()) {
      runInAction(() => {
        this.step = 2;
      });
    }
  }

  backToPhrase(): void {
    this.step = 1;
  }

  setPassword(value: string): void {
    this.password = value;
  }

  setConfirmPassword(value: string): void {
    this.confirmPassword = value;
  }

  get passwordErrors(): string[] {
    return validatePassword(this.password);
  }

  get passwordValid(): boolean {
    return this.passwordErrors.length === 0;
  }

  get passwordMatched(): boolean {
    return this.password.length > 0 && this.password === this.confirmPassword;
  }

  get canSubmit(): boolean {
    return this.countOk && this.passwordValid && this.passwordMatched;
  }

  /** 提交导入：与主进程创建账户同一条通路（加密助记词落盘 + 派生 ETH 账户） */
  async submit(): Promise<UnlockResult> {
    if (!this.canSubmit) throw new Error(localeStore.t('err.checkPhraseAndPassword'));

    this.loading = true;
    this.error = null;
    try {
      const api = window.walletAPI;
      if (!api?.createAccount) {
        throw new Error(localeStore.t('err.envImport'));
      }
      const result = await api.createAccount(this.mnemonicPhrase, this.password);
      runInAction(() => {
        this.loading = false;
      });
      return result;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : localeStore.t('err.importFailed');
        this.loading = false;
      });
      throw err;
    }
  }

  reset(): void {
    this.step = 1;
    this.phrase = '';
    this.valid = null;
    this.checking = false;
    this.password = '';
    this.confirmPassword = '';
    this.loading = false;
    this.error = null;
  }
}

export const importWalletStore = new ImportWalletStore();
