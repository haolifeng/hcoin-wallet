export interface SectionRow {
  key: string;
  [column: string]: string | number;
}

/** 启动检测结果 */
export interface MnemonicState {
  exists: boolean;
  address: string | null;
}

/** 解锁/创建成功后的账户信息 */
export interface UnlockResult {
  address: string;
  ethAddress: string;
}

declare global {
  interface Window {
    walletAPI?: {
      getBalance: (address: string) => Promise<number>;
      getSectionData: (section: string) => Promise<SectionRow[]>;
      generateMnemonic: () => Promise<string>;
      createAccount: (
        mnemonic: string,
        password: string,
      ) => Promise<UnlockResult>;
      listAccounts: () => Promise<
        { address: string; createdAt: number; hasSecret: boolean; ethAddress?: string }[]
      >;
      backupMnemonic: (address: string, password: string) => Promise<string>;
      hasMnemonic: () => Promise<MnemonicState>;
      unlockWallet: (address: string, password: string) => Promise<UnlockResult>;
    };
  }
}

export {};
