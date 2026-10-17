import { makeAutoObservable, runInAction } from 'mobx';
import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  isLocale,
  translate,
  type Locale,
  type MessageKey,
  type MessageParams,
} from '../i18n/messages';

/**
 * 语言（中文 / English）全局状态。
 * 真值由主进程持久化（userData/locale.json），此处负责同步与切换；
 * 组件内统一用 `useT()` 取翻译函数，store 内用 `localeStore.t()`。
 */
class LocaleStore {
  locale: Locale = DEFAULT_LOCALE;

  constructor() {
    // t 是只读取值，显式排除在自动注解之外，避免被当作 action（action 内读取不会被追踪）
    makeAutoObservable(this, { t: false });
  }

  /** 非组件场景（store / 工具函数）取文案 */
  t(key: MessageKey, params?: MessageParams): string {
    return translate(this.locale, key, params);
  }

  /** 应用启动：以主进程持久化的语言为准，非 Electron 环境回落到本地缓存 */
  async init(): Promise<void> {
    const cached = this.readCache();
    if (cached) {
      runInAction(() => {
        this.locale = cached;
      });
      this.applyLocale(cached);
    }

    const api = window.walletAPI;
    if (!api?.getLocale) return;

    // 渲染进程可能早于主进程注册 IPC 处理器，失败时重试几次
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const locale = await api.getLocale();
        if (isLocale(locale)) {
          runInAction(() => {
            this.locale = locale;
          });
          this.writeCache(locale);
          this.applyLocale(locale);
        }
        return;
      } catch {
        await new Promise((resolve) => window.setTimeout(resolve, 300));
      }
    }
    // 读取失败保留本地缓存值，不阻塞启动
  }

  /** 切换语言：同步主进程（主进程错误提示同样需要本地化）并写入本地缓存 */
  async setLocale(locale: Locale): Promise<void> {
    if (locale === this.locale) return;
    runInAction(() => {
      this.locale = locale;
    });
    this.writeCache(locale);
    this.applyLocale(locale);

    const api = window.walletAPI;
    if (!api?.setLocale) return;
    try {
      await api.setLocale(locale);
    } catch {
      // 同步失败不影响界面语言，仅主进程提示仍沿用上次语言
    }
  }

  /** 同步 <html lang>，便于无障碍与字体渲染 */
  private applyLocale(locale: Locale): void {
    try {
      document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    } catch {
      // 忽略（非浏览器环境）
    }
  }

  private readCache(): Locale | null {
    try {
      const raw = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      return isLocale(raw) ? raw : null;
    } catch {
      return null;
    }
  }

  private writeCache(locale: Locale): void {
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // 隐私模式下 localStorage 可能不可用，忽略
    }
  }
}

export const localeStore = new LocaleStore();
