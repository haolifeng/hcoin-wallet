import type { HDNodeWallet } from 'ethers';
import type { BtcAccount } from './bitcoin';
import type { SolAccount } from './solana';
import { getNetwork, type NetworkType } from './network';

/**
 * 主进程内存中的当前解锁会话。
 * 私钥/钱包对象仅存在于主进程内存，绝不落盘、绝不通过 IPC 回传渲染进程。
 * 会话会因空闲超时、系统锁屏/休眠、手动锁定或应用退出而失效。
 */
interface ActiveWallet {
  /** 钱包账户地址（数据库键） */
  address: string;
  /** 可签名的 EVM（ETH / AVAX）HD 钱包，主网与测试网地址一致 */
  wallet: HDNodeWallet;
  /**
   * 可签名的 BTC 账户（含私钥，仅内存）。
   * 主网与测试网的 BIP84 派生路径不同（coinType 0 / 1），私钥也不同，
   * 因此按网络分别派生并缓存，切换网络时无需重新解密助记词。
   */
  btc: Record<NetworkType, BtcAccount>;
  /** 可签名的 Solana 账户（含私钥，仅内存），主网与测试网地址/私钥一致 */
  sol: SolAccount;
}

/** 会话被锁定的原因 */
export type LockReason = 'idle' | 'screen-lock' | 'suspend' | 'manual' | 'quit';

type LockListener = (reason: LockReason) => void;

let activeWallet: ActiveWallet | null = null;
let lockListener: LockListener | null = null;

/** 注册锁定通知（主进程在锁定后通知渲染进程回到解锁界面） */
export function setLockListener(listener: LockListener | null): void {
  lockListener = listener;
}

/** 建立解锁会话（解锁成功 / 创建或导入账户成功后调用） */
export function setActiveWallet(
  address: string,
  wallet: HDNodeWallet,
  btc: Record<NetworkType, BtcAccount>,
  sol: SolAccount,
): void {
  activeWallet = { address, wallet, btc, sol };
}

/** 读取当前解锁会话，未解锁时返回 null */
export function getActiveWallet(): ActiveWallet | null {
  return activeWallet;
}

/** 读取当前网络环境下可用的 BTC 账户（未解锁时返回 null） */
export function getActiveBtcAccount(): BtcAccount | null {
  return activeWallet ? activeWallet.btc[getNetwork()] : null;
}

/** 清除解锁会话（应用退出） */
export function clearActiveWallet(): void {
  activeWallet = null;
}

/**
 * 锁定钱包：丢弃内存中的签名材料，并通知渲染进程。
 * 未解锁时（或重复锁定）不触发通知。
 */
export function lockWallet(reason: LockReason): boolean {
  if (!activeWallet) return false;
  activeWallet = null;
  lockListener?.(reason);
  return true;
}
