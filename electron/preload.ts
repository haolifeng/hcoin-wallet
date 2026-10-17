import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('walletAPI', {
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
  }) => ipcRenderer.invoke('wallet:send', params),
});
