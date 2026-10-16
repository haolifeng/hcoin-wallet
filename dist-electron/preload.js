"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("walletAPI", {
  getBalance: (address) => electron.ipcRenderer.invoke("wallet:getBalance", address),
  getSectionData: (section) => electron.ipcRenderer.invoke("wallet:getSectionData", section),
  generateMnemonic: () => electron.ipcRenderer.invoke("wallet:generateMnemonic"),
  validateMnemonic: (mnemonic) => electron.ipcRenderer.invoke("wallet:validateMnemonic", mnemonic),
  createAccount: (mnemonic, password) => electron.ipcRenderer.invoke("wallet:createAccount", mnemonic, password),
  listAccounts: () => electron.ipcRenderer.invoke("wallet:listAccounts"),
  backupMnemonic: (address, password) => electron.ipcRenderer.invoke("wallet:backupMnemonic", address, password),
  hasMnemonic: () => electron.ipcRenderer.invoke("wallet:hasMnemonic"),
  unlockWallet: (address, password) => electron.ipcRenderer.invoke("wallet:unlockWallet", address, password)
});
