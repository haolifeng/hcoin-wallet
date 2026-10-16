import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('walletAPI', {
  getBalance: (address: string) =>
    ipcRenderer.invoke('wallet:getBalance', address),
  getSectionData: (section: string) =>
    ipcRenderer.invoke('wallet:getSectionData', section),
  generateMnemonic: () =>
    ipcRenderer.invoke('wallet:generateMnemonic'),
  createAccount: (mnemonic: string, password: string) =>
    ipcRenderer.invoke('wallet:createAccount', mnemonic, password),
  listAccounts: () => ipcRenderer.invoke('wallet:listAccounts'),
  backupMnemonic: (address: string, password: string) =>
    ipcRenderer.invoke('wallet:backupMnemonic', address, password),
  hasMnemonic: () => ipcRenderer.invoke('wallet:hasMnemonic'),
  unlockWallet: (address: string, password: string) =>
    ipcRenderer.invoke('wallet:unlockWallet', address, password),
});
