import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { IpcMainInvokeEvent } from 'electron';
import { t } from './locale';

/**
 * 主进程安全工具：
 *  - IPC 调用方（frame）校验
 *  - 密码强度校验（主进程为最终裁决，渲染层校验只用于即时提示）
 *  - 密码尝试限速（防止通过 IPC 在线爆破）
 */

/**
 * 生产环境下渲染进程允许的页面文件前缀。
 * main.js 位于 dist-electron/，其上级目录即应用根（打包后为 app.asar），
 * 因此 ../dist 在开发和打包两种形态下都指向正确的渲染进程产物目录。
 */
function prodPagePrefix(): string {
  return pathToFileURL(path.join(__dirname, '..', 'dist') + path.sep).href;
}

/**
 * 校验 IPC 调用来自我们自己的页面。
 * 目的：即使渲染进程被注入第三方脚本 / 打开其它窗口，也无法直接调用钱包 IPC。
 */
export function assertTrustedSender(event: IpcMainInvokeEvent): void {
  const frameUrl = event.senderFrame?.url ?? '';
  const devUrl = process.env.VITE_DEV_SERVER_URL;

  const trusted = devUrl ? frameUrl.startsWith(devUrl) : frameUrl.startsWith(prodPagePrefix());

  if (!trusted) {
    console.warn(`[security] 拒绝来自不可信来源的 IPC 调用: ${frameUrl || '(empty)'}`);
    throw new Error('Untrusted IPC sender');
  }
}

// ---------------------------------------------------------------- 密码强度

/**
 * 密码规则（与渲染层 CreateWalletStore.validatePassword 保持一致）：
 * 至少 8 位，含大写字母、小写字母、数字与特殊字符。
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[0-9]/.test(password) &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

/** 主进程强制校验密码强度（不信任渲染层） */
export function assertStrongPassword(password: string): void {
  if (!password) throw new Error(t('err.passwordRequired'));
  if (!isStrongPassword(password)) throw new Error(t('err.passwordInvalid'));
}

// ---------------------------------------------------------------- 认证限速

/** 前 5 次失败不锁定 */
const MAX_FREE_ATTEMPTS = 5;
/** 超过后每次失败锁定 15s 起，指数退避，最长 5 分钟 */
const BASE_LOCK_MS = 15_000;
const MAX_LOCK_MS = 5 * 60_000;

let failedAttempts = 0;
let lockedUntil = 0;

/** 认证前调用：处于锁定窗口期内直接拒绝，避免继续消耗 scrypt（防在线爆破 + DoS） */
export function assertAuthAllowed(): void {
  const remaining = lockedUntil - Date.now();
  if (remaining > 0) {
    throw new Error(t('err.tooManyAttempts', { seconds: Math.ceil(remaining / 1000) }));
  }
}

/** 记录一次认证失败，必要时进入锁定窗口（第 5 次失败后立即锁定下一次尝试） */
export function recordAuthFailure(): void {
  failedAttempts += 1;
  if (failedAttempts >= MAX_FREE_ATTEMPTS) {
    const over = failedAttempts - MAX_FREE_ATTEMPTS + 1;
    const delay = Math.min(BASE_LOCK_MS * 2 ** (over - 1), MAX_LOCK_MS);
    lockedUntil = Date.now() + delay;
  }
}

/** 认证成功后清空计数 */
export function resetAuthFailures(): void {
  failedAttempts = 0;
  lockedUntil = 0;
}

/** 供测试/诊断使用 */
export function getAuthState(): { failedAttempts: number; lockedUntil: number } {
  return { failedAttempts, lockedUntil };
}
