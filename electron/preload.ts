import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('walletAPI', {
  getLocale: () => ipcRenderer.invoke('wallet:getLocale'),
  setLocale: (locale: 'zh' | 'en') => ipcRenderer.invoke('wallet:setLocale', locale),
  getNetwork: () => ipcRenderer.invoke('wallet:getNetwork'),
  setNetwork: (network: 'mainnet' | 'testnet') =>
    ipcRenderer.invoke('wallet:setNetwork', network),
  getBalance: (address: string) =>
    ipcRenderer.invoke('wallet:getBalance', address),
  getChainBalances: (address: string) =>
    ipcRenderer.invoke('wallet:getChainBalances', address),
  getSectionData: (section: string) =>
    ipcRenderer.invoke('wallet:getSectionData', section),
  generateMnemonic: () =>
    ipcRenderer.invoke('wallet:generateMnemonic'),
  validateMnemonic: (mnemonic: string) =>
    ipcRenderer.invoke('wallet:validateMnemonic', mnemonic),
  createAccount: (mnemonic: string, password: string) =>
    ipcRenderer.invoke('wallet:createAccount', mnemonic, password),
  listAccounts: () => ipcRenderer.invoke('wallet:listAccounts'),
  backupMnemonic: (address: string, password: string) =>
    ipcRenderer.invoke('wallet:backupMnemonic', address, password),
  hasMnemonic: () => ipcRenderer.invoke('wallet:hasMnemonic'),
  unlockWallet: (address: string, password: string) =>
    ipcRenderer.invoke('wallet:unlockWallet', address, password),
  send: (params: {
    address: string;
    chain: string;
    asset: string;
    to: string;
    amount: string;
    /** 支付密码：主进程校验通过后才会签名 */
    password: string;
  }) => ipcRenderer.invoke('wallet:send', params),
  lock: () => ipcRenderer.invoke('wallet:lock'),
  /** 订阅「钱包被锁定」事件（空闲超时 / 锁屏 / 休眠 / 手动），返回取消订阅函数 */
  onLocked: (callback: (reason: string) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, reason: string) => callback(reason);
    ipcRenderer.on('wallet:locked', listener);
    return () => {
      ipcRenderer.removeListener('wallet:locked', listener);
    };
  },
});
