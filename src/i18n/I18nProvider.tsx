import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { observer } from 'mobx-react-lite';
import { localeStore } from '../stores/LocaleStore';
import { translate, type Locale, type MessageKey, type MessageParams } from './messages';

/** antd 内置文案包 */
const ANTD_LOCALE: Record<Locale, typeof zhCN> = { zh: zhCN, en: enUS };

interface I18nValue {
  locale: Locale;
  /** 翻译函数，支持 `{name}` 占位参数 */
  t: (key: MessageKey, params?: MessageParams) => string;
}

const I18nContext = createContext<I18nValue>({
  locale: 'zh',
  t: (key, params) => translate('zh', key, params),
});

/**
 * 语言环境 Provider：读取 LocaleStore（observer）→ 语言变化时重建 context，
 * 使所有使用 useT() 的组件重新渲染；同时切换 antd 内置文案（DatePicker / Table 等）。
 */
export const I18nProvider = observer(({ children }: { children: ReactNode }) => {
  const locale = localeStore.locale;

  const value = useMemo<I18nValue>(
    () => ({ locale, t: (key, params) => translate(locale, key, params) }),
    [locale],
  );

  return (
    <ConfigProvider locale={ANTD_LOCALE[locale]}>
      <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    </ConfigProvider>
  );
});

/** 组件内取翻译函数 */
export function useT(): I18nValue['t'] {
  return useContext(I18nContext).t;
}

/** 组件内取当前语言 */
export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
