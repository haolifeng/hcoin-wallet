export interface SectionRow {
  key: string;
  [column: string]: string | number;
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
      ) => Promise<{ address: string }>;
      listAccounts: () =>
        Promise<{ address: string; createdAt: number; hasSecret: boolean }[]>;
      backupMnemonic: (address: string, password: string) => Promise<string>;
    };
  }
}

export {};
