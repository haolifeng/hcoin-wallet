import fs from 'node:fs/promises';
import path from 'node:path';
import { app } from 'electron';
// 文案字典放在 src 下，主进程与渲染进程共用同一份，避免两处文案漂移
import {
  DEFAULT_LOCALE,
  isLocale,
  translate,
  type Locale,
  type MessageKey,
  type MessageParams,
} from '../src/i18n/messages';

/** 语言类型直接沿用共享字典中的定义 */
export type { Locale } from '../src/i18n/messages';

/** 语言持久化文件名（落在 Electron userData 目录） */
const LOCALE_FILE = 'locale.json';

let currentLocale: Locale = DEFAULT_LOCALE;

/** 读取当前语言 */
export function getLocale(): Locale {
  return currentLocale;
}

function localeFilePath(): string {
  return path.join(app.getPath('userData'), LOCALE_FILE);
}

/** 应用启动时读取上次选择的语言并写入内存 */
export async function loadLocale(): Promise<Locale> {
  try {
    const raw = await fs.readFile(localeFilePath(), 'utf8');
    const parsed = JSON.parse(raw) as { locale?: unknown };
    currentLocale = isLocale(parsed.locale) ? parsed.locale : DEFAULT_LOCALE;
  } catch {
    currentLocale = DEFAULT_LOCALE;
  }
  return currentLocale;
}

/** 切换语言并持久化，下次启动沿用 */
export async function setLocale(locale: Locale): Promise<Locale> {
  if (!isLocale(locale)) {
    throw new Error(`不支持的语言：${String(locale)}`);
  }
  currentLocale = locale;
  try {
    await fs.writeFile(localeFilePath(), JSON.stringify({ locale }), 'utf8');
  } catch (err) {
    console.error('[locale] 持久化语言失败:', err);
  }
  return currentLocale;
}

/** 主进程取文案（用于抛给渲染进程的错误提示） */
export function t(key: MessageKey, params?: MessageParams): string {
  return translate(currentLocale, key, params);
}
