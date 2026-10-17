/** 语言选项（设置弹窗中的「语言」切换项） */
import type { Locale, MessageKey } from '../i18n/messages';

export const LOCALE_OPTIONS: { value: Locale; labelKey: MessageKey }[] = [
  { value: 'zh', labelKey: 'locale.zh' },
  { value: 'en', labelKey: 'locale.en' },
];

/** 语言名称对应的文案 key（用于提示语） */
export const LOCALE_LABEL_KEY: Record<Locale, MessageKey> = {
  zh: 'locale.zh',
  en: 'locale.en',
};
