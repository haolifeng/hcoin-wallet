import type { HDNodeWallet } from 'ethers';
import type { BtcAccount } from './bitcoin';
import type { SolAccount } from './solana';
import { getNetwork, type NetworkType } from './network';

/**
 * 主进程内存中的当前解锁会话。
 * 私钥/钱包对象仅存在于主进程内存，绝不落盘、绝不通过 IPC 回传渲染进程。
 * 应用退出（窗口关闭即退出）后内存被回收，会话自然失效。
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

let activeWallet: ActiveWallet | null = null;

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

/** 清除解锁会话（锁定钱包 / 应用退出） */
export function clearActiveWallet(): void {
  activeWallet = null;
}
