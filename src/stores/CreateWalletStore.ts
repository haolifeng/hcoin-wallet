import { makeAutoObservable, runInAction } from 'mobx';
import { menuStore } from './MenuStore';

const WORD_COUNT = 12;
/** 校验环节需要回填的单词数量 */
const VERIFY_COUNT = 4;

export type CreateStep = 1 | 2 | 3;

/** 从 12 个序号中随机抽取 count 个不重复序号（升序返回，符合阅读习惯） */
function pickIndexes(count: number): number[] {
  const all = Array.from({ length: WORD_COUNT }, (_, i) => i);
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, count).sort((a, b) => a - b);
}

/**
 * 密码规则校验：
 * - 至少 8 位
 * - 包含字母、数字与特殊字符
 * - 至少 1 个大写字母
 * - 至少 1 个特殊字符
 * 返回错误信息数组，为空表示通过。
 */
export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push('至少 8 位');
  if (!/[0-9]/.test(password)) errors.push('至少包含一个数字');
  if (!/[a-zA-Z]/.test(password)) errors.push('至少包含一个字母');
  if (!/[A-Z]/.test(password)) errors.push('至少包含一个大写字母');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('至少包含一个特殊字符');
  return errors;
}

class CreateWalletStore {
  visible = false;
  step: CreateStep = 1;
  /** 助记词只保存在内存中，弹窗关闭即清空 */
  mnemonic: string[] = [];
  verifyIndexes: number[] = [];
  verifyInputs: string[] = [];
  password = '';
  confirmPassword = '';
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get mnemonicPhrase(): string {
    return this.mnemonic.join(' ');
  }

  /** 打开向导：先生成 12 个助记词（主进程 BIP39 生成） */
  async open(): Promise<void> {
    this.reset();
    this.visible = true;
    await this.generateMnemonic();
  }

  close(): void {
    this.visible = false;
    this.reset();
  }

  async generateMnemonic(): Promise<void> {
    this.loading = true;
    this.error = null;
    try {
      const api = window.walletAPI;
      if (!api?.generateMnemonic) {
        throw new Error('当前环境不支持创建账户（未检测到 Electron 接口）');
      }
      const phrase = await api.generateMnemonic();
      runInAction(() => {
        this.mnemonic = phrase.split(' ');
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '助记词生成失败';
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  /** 第一步 → 第二步：随机抽取 4 个待校验序号 */
  goVerify(): void {
    this.verifyIndexes = pickIndexes(VERIFY_COUNT);
    this.verifyInputs = this.verifyIndexes.map(() => '');
    this.step = 2;
  }

  backToMnemonic(): void {
    this.step = 1;
  }

  setVerifyInput(index: number, value: string): void {
    this.verifyInputs[index] = value;
  }

  /** 校验第 i 个输入是否与对应助记词一致（未填写时视为未完成，不算错误） */
  isVerifyCorrect(i: number): boolean {
    const input = (this.verifyInputs[i] ?? '').trim().toLowerCase();
    if (!input) return false;
    return input === this.mnemonic[this.verifyIndexes[i]];
  }

  /** 4 个词全部填写且正确 */
  get verifyPassed(): boolean {
    return (
      this.verifyIndexes.length === VERIFY_COUNT &&
      this.verifyIndexes.every((_, i) => this.isVerifyCorrect(i))
    );
  }

  /** 第二步 → 第三步 */
  goSetPassword(): void {
    if (!this.verifyPassed) return;
    this.step = 3;
  }

  backToVerify(): void {
    this.step = 2;
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
    return this.passwordValid && this.passwordMatched;
  }

  /** 提交创建：加密并写入 LevelDB，成功后刷新账户列表 */
  async submit(): Promise<string> {
    if (!this.canSubmit) throw new Error('密码不符合要求');

    this.loading = true;
    this.error = null;
    try {
      const api = window.walletAPI;
      if (!api?.createAccount) {
        throw new Error('当前环境不支持创建账户（未检测到 Electron 接口）');
      }
      const { address } = await api.createAccount(this.mnemonicPhrase, this.password);
      // 刷新数据；切到「账户」分区，方便直接看到新建的账户
      if (menuStore.selectedKey !== 'accounts') {
        menuStore.select('accounts');
      } else {
        void menuStore.loadData();
      }
      runInAction(() => {
        this.loading = false;
      });
      return address;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '创建账户失败';
        this.loading = false;
      });
      throw err;
    }
  }

  /** 重置向导状态（助记词与密码仅存在于内存，随重置清除） */
  reset(): void {
    this.step = 1;
    this.mnemonic = [];
    this.verifyIndexes = [];
    this.verifyInputs = [];
    this.password = '';
    this.confirmPassword = '';
    this.loading = false;
    this.error = null;
  }
}

export const createWalletStore = new CreateWalletStore();
