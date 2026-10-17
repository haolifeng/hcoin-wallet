import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';

/**
 * 网络环境：主网 / 测试网。
 * 全应用（RPC 节点、代币合约、区块浏览器、BTC 派生路径）共用同一份取值。
 */
export type NetworkType = 'mainnet' | 'testnet';

/** 默认网络环境：首次启动走测试网，避免误用真实资金 */
export const DEFAULT_NETWORK: NetworkType = 'testnet';

/** 网络环境持久化文件名（落在 Electron userData 目录） */
const NETWORK_FILE = 'network.json';

let currentNetwork: NetworkType = DEFAULT_NETWORK;

/** 判断入参是否为合法的网络环境 */
export function isNetworkType(value: unknown): value is NetworkType {
  return value === 'mainnet' || value === 'testnet';
}

/** 读取当前网络环境 */
export function getNetwork(): NetworkType {
  return currentNetwork;
}

function networkFilePath(): string {
  return path.join(app.getPath('userData'), NETWORK_FILE);
}

/**
 * 应用启动时读取上次选择的网络环境并写入内存。
 * 文件不存在或内容非法时回落到默认网络（测试网）。
 */
export async function loadNetwork(): Promise<NetworkType> {
  try {
    const raw = await fs.readFile(networkFilePath(), 'utf8');
    const parsed = JSON.parse(raw) as { network?: unknown };
    currentNetwork = isNetworkType(parsed.network) ? parsed.network : DEFAULT_NETWORK;
  } catch {
    currentNetwork = DEFAULT_NETWORK;
  }
  return currentNetwork;
}

/**
 * 切换网络环境并持久化，下次启动沿用。
 * 调用方负责在此之后重置 RPC 连接缓存并重新轮询余额。
 */
export async function setNetwork(network: NetworkType): Promise<NetworkType> {
  if (!isNetworkType(network)) {
    throw new Error(`不支持的网络环境：${String(network)}`);
  }
  currentNetwork = network;
  try {
    await fs.writeFile(networkFilePath(), JSON.stringify({ network }), 'utf8');
  } catch (err) {
    // 持久化失败不影响本次会话内的切换，仅下次启动回落到默认值
    console.error('[network] 持久化网络环境失败:', err);
  }
  return currentNetwork;
}
