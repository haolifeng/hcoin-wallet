/**
 * 网络环境：主网 / 测试网（与主进程 electron/network.ts 保持一致）。
 * 切换后全应用共用同一份取值：链名称、区块浏览器、地址与风险提示。
 */
import type { MessageKey } from '../i18n/messages';

export type NetworkType = 'mainnet' | 'testnet';

/** 默认网络环境：首次启动走测试网，避免误用真实资金 */
export const DEFAULT_NETWORK: NetworkType = 'testnet';

/** 网络环境展示名对应的文案 key（随语言切换） */
export const NETWORK_LABEL_KEY: Record<NetworkType, MessageKey> = {
  mainnet: 'network.mainnet',
  testnet: 'network.testnet',
};

/** 设置里的网络切换选项 */
export const NETWORK_OPTIONS: {
  value: NetworkType;
  labelKey: MessageKey;
  descKey: MessageKey;
}[] = [
  { value: 'mainnet', labelKey: 'network.mainnet', descKey: 'network.mainnetDesc' },
  { value: 'testnet', labelKey: 'network.testnet', descKey: 'network.testnetDesc' },
];

/** 本地缓存键（非 Electron 环境或主进程不可用时的兜底） */
export const NETWORK_STORAGE_KEY = 'hcoin-wallet:network';

/** 判断入参是否为合法的网络环境 */
export function isNetworkType(value: unknown): value is NetworkType {
  return value === 'mainnet' || value === 'testnet';
}
