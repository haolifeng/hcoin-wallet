import { makeAutoObservable } from 'mobx';
import { getChainDisplay, type ChainDisplay } from '../constants/chains';
import { networkStore } from './NetworkStore';
import { localeStore } from './LocaleStore';

export interface MenuItem {
  key: string;
  label: string;
}

/**
 * 左侧菜单项：首项「总览」聚合各链资产，其余按链维度展示。
 * 顺序固定为 总览、BTC、ETH、AVAX、SOL；币种符号不翻译，仅「总览」随语言切换。
 */
const MENU_KEYS = ['overview', 'btc', 'eth', 'avax', 'sol'];

export class MenuStore {
  /** 当前选中的菜单 key，默认「总览」 */
  selectedKey = 'overview';

  constructor() {
    makeAutoObservable(this);
  }

  /** 选择菜单项（链） */
  select(key: string): void {
    this.selectedKey = key;
  }

  /** 菜单项（「总览」文案随语言切换） */
  get menuItems(): MenuItem[] {
    return MENU_KEYS.map((key) => ({
      key,
      label: key === 'overview' ? localeStore.t('menu.overview') : key.toUpperCase(),
    }));
  }

  /** 当前选中链的展示配置（随网络环境变化，找不到时返回 undefined） */
  get currentChain(): ChainDisplay | undefined {
    return getChainDisplay(this.selectedKey, networkStore.network);
  }

  /** 当前选中菜单项的文字 */
  get currentLabel(): string {
    return this.menuItems.find((m) => m.key === this.selectedKey)?.label ?? '';
  }
}

export const menuStore = new MenuStore();
