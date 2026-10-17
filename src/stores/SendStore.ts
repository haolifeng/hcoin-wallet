import { makeAutoObservable, runInAction } from 'mobx';
import { startupStore } from './StartupStore';
import type { SendAsset } from '../types/global';

/**
 * 发送交易弹窗状态。
 * 私钥签名发生在主进程，此处只收集参数并展示结果。
 */
class SendStore {
  visible = false;
  asset: SendAsset = 'ETH';
  to = '';
  amount = '';
  sending = false;
  error: string | null = null;
  /** 发送成功后的交易哈希 */
  txHash: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 打开弹窗，可指定默认资产 */
  open(asset: SendAsset = 'ETH'): void {
    this.visible = true;
    this.asset = asset;
    this.to = '';
    this.amount = '';
    this.error = null;
    this.txHash = null;
  }

  close(): void {
    this.visible = false;
    this.sending = false;
    this.error = null;
    this.txHash = null;
    this.to = '';
    this.amount = '';
  }

  setAsset(asset: SendAsset): void {
    this.asset = asset;
    this.error = null;
  }

  setTo(value: string): void {
    this.to = value;
  }

  setAmount(value: string): void {
    this.amount = value;
  }

  /** 当前选中资产的可用余额（用于界面展示 / 校验） */
  get available(): number | undefined {
    if (this.asset === 'ETH') return startupStore.ethBalance ?? undefined;
    return startupStore.tokenBalances[this.asset];
  }

  get canSubmit(): boolean {
    const value = Number(this.amount);
    return (
      Boolean(this.to.trim()) &&
      Number.isFinite(value) &&
      value > 0 &&
      !this.sending
    );
  }

  /** 提交发送：调用主进程签名并广播，返回交易哈希 */
  async submit(): Promise<string> {
    const api = window.walletAPI;
    if (!api?.send) {
      throw new Error('当前环境不支持发送（未检测到 Electron 接口）');
    }
    const address = startupStore.account?.address;
    if (!address) throw new Error('请先解锁钱包');

    this.sending = true;
    this.error = null;
    try {
      const hash = await api.send({
        address,
        asset: this.asset,
        to: this.to.trim(),
        amount: this.amount.trim(),
      });
      runInAction(() => {
        this.txHash = hash;
        this.sending = false;
      });
      // 交易提交后刷新余额展示
      void startupStore.refreshBalances();
      return hash;
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '发送失败';
        this.sending = false;
      });
      throw err;
    }
  }
}

export const sendStore = new SendStore();
