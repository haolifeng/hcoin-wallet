import type { HDNodeWallet } from 'ethers';

/**
 * 主进程内存中的当前解锁会话。
 * 私钥/钱包对象仅存在于主进程内存，绝不落盘、绝不通过 IPC 回传渲染进程。
 * 应用退出（窗口关闭即退出）后内存被回收，会话自然失效。
 */
interface ActiveWallet {
  /** 钱包账户地址（数据库键） */
  address: string;
  /** 可签名的 HD 钱包 */
  wallet: HDNodeWallet;
}

let activeWallet: ActiveWallet | null = null;

/** 建立解锁会话（解锁成功 / 创建或导入账户成功后调用） */
export function setActiveWallet(address: string, wallet: HDNodeWallet): void {
  activeWallet = { address, wallet };
}

/** 读取当前解锁会话，未解锁时返回 null */
export function getActiveWallet(): ActiveWallet | null {
  return activeWallet;
}

/** 清除解锁会话（锁定钱包 / 应用退出） */
export function clearActiveWallet(): void {
  activeWallet = null;
}
