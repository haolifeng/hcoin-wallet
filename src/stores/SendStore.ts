import { makeAutoObservable, runInAction } from 'mobx';
import { startupStore } from './StartupStore';
import { networkStore } from './NetworkStore';
import { localeStore } from './LocaleStore';
import {
  getChainDisplay,
  buildAssetValue,
  resolveChainAddress,
  type ChainDisplay,
} from '../constants/chains';

/**
 * 发送交易弹窗状态。
 * 私钥签名发生在主进程，此处只收集参数并展示结果。
 */
class SendStore {
  visible = false;
  /** 链 key，如 'eth' / 'avax' */
  chain = 'eth';
  /** 资产符号：ETH / AVAX / USDT / USDC */
  asset = 'ETH';
  to = '';
  amount = '';
  sending = false;
  error: string | null = null;
  /** 发送成功后的交易哈希 */
  txHash: string | null = null;
  /** 是否锁定资产：从某个币种行发起发送时，只允许发送该币种 */
  lockAsset = false;

  constructor() {
    makeAutoObservable(this);
  }

  /**
   * 打开弹窗，可指定默认资产（格式 `<chainKey>:<symbol>`，默认 ETH 链的 ETH）。
   * lockAsset 为 true 时锁定该资产，用户只能发送选中的币种。
   */
  open(
    selection: string = buildAssetValue('eth', 'ETH'),
    options: { lockAsset?: boolean } = {},
  ): void {
    this.applySelection(selection);
    this.lockAsset = Boolean(options.lockAsset);
    this.visible = true;
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
    this.lockAsset = false;
  }

  /** 解析并设置当前选中的链与资产 */
  private applySelection(selection: string): void {
    const [chain, asset] = selection.split(':');
    this.chain = chain || 'eth';
    this.asset = asset || 'ETH';
    this.error = null;
  }

  setSelection(selection: string): void {
    this.applySelection(selection);
  }

  setTo(value: string): void {
    this.to = value;
  }

  setAmount(value: string): void {
    this.amount = value;
  }

  /** 当前选中链的展示配置（随网络环境变化） */
  get currentChain(): ChainDisplay | undefined {
    return getChainDisplay(this.chain, networkStore.network);
  }

  /** 当前链上的发送方地址（from） */
  get fromAddress(): string | undefined {
    const account = startupStore.account;
    const chain = this.currentChain;
    if (!account || !chain) return undefined;
    return resolveChainAddress(chain, account);
  }

  /** 当前选中资产的可用余额（用于界面展示 / 校验） */
  get available(): number | undefined {
    const balances = startupStore.chainBalances[this.chain];
    if (!balances) return undefined;
    const chain = this.currentChain;
    if (this.asset === chain?.nativeSymbol) return balances.native;
    return balances.tokens?.[this.asset];
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
      throw new Error(localeStore.t('err.envSend'));
    }
    const address = startupStore.account?.address;
    if (!address) throw new Error(localeStore.t('err.unlockFirst'));

    this.sending = true;
    this.error = null;
    try {
      const hash = await api.send({
        address,
        chain: this.chain,
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
        this.error = err instanceof Error ? err.message : localeStore.t('err.sendFailed');
        this.sending = false;
      });
      throw err;
    }
  }
}

export const sendStore = new SendStore();
