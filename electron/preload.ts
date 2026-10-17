import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('walletAPI', {
  getBalance: (address: string) =>
    ipcRenderer.invoke('wallet:getBalance', address),
  getEthBalance: (address: string) =>
    ipcRenderer.invoke('wallet:getEthBalance', address),
  getTokenBalances: (address: string) =>
    ipcRenderer.invoke('wallet:getTokenBalances', address),
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
    asset: 'ETH' | 'USDT' | 'USDC';
    to: string;
    amount: string;
  }) => ipcRenderer.invoke('wallet:send', params),
});
