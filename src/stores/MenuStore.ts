import { makeAutoObservable, runInAction } from 'mobx';
import type { SectionRow } from '../types/global';

export interface MenuItem {
  key: string;
  label: string;
}

// 浏览器（非 Electron）环境下的兜底演示数据，保证 `vite dev` 也能看到效果
const FALLBACK_DATA: Record<string, SectionRow[]> = {
  dashboard: [
    { key: 'a1', address: 'HC0xDEMO0001', balance: '1234.56', createdAt: '2026/01/01 10:00:00' },
  ],
  accounts: [
    { key: 'a1', address: 'HC0xDEMO0001', balance: '1234.56', createdAt: '2026/01/01 10:00:00' },
  ],
  balance: [
    { key: 'a1', address: 'HC0xDEMO0001', balance: '1234.56' },
  ],
  about: [
    { key: 'name', item: '钱包名称', value: 'HCoinWallet' },
    { key: 'net', item: '网络环境', value: '主网 (Mainnet)' },
    { key: 'ver', item: '客户端版本', value: 'v0.0.1' },
    { key: 'db', item: '数据存储', value: 'LevelDB (classic-level)' },
  ],
};

export class MenuStore {
  menuItems: MenuItem[] = [
    { key: 'dashboard', label: '总揽' },
    { key: 'accounts',  label: '账户' },
    { key: 'balance',   label: '余额' },
    { key: 'about',     label: '关于' },
  ];

  selectedKey = 'dashboard';
  rows: SectionRow[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  /** 选择菜单项并触发数据加载 */
  select(key: string) {
    if (this.selectedKey === key) return;
    this.selectedKey = key;
    void this.loadData();
  }

  /** 从后端数据库读取当前选中分区的数据 */
  async loadData() {
    this.loading = true;
    this.error = null;
    try {
      let data: SectionRow[];
      if (window.walletAPI?.getSectionData) {
        // Electron：通过 IPC 读取真实数据库数据
        data = await window.walletAPI.getSectionData(this.selectedKey);
      } else {
        // 浏览器：使用兜底演示数据
        data = FALLBACK_DATA[this.selectedKey] ?? [];
      }
      runInAction(() => {
        this.rows = data;
        this.loading = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = err instanceof Error ? err.message : '数据加载失败';
        this.rows = [];
        this.loading = false;
      });
    }
  }

  get currentLabel(): string {
    return this.menuItems.find((m) => m.key === this.selectedKey)?.label ?? '';
  }
}

export const menuStore = new MenuStore();

// 首次进入时加载默认分区数据
void menuStore.loadData();
