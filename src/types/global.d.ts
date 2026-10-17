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

/** 可发送的资产类型 */
export type SendAsset = 'ETH' | 'USDT' | 'USDC';

/** 发送交易参数 */
export interface SendParams {
  address: string;
  asset: SendAsset;
  to: string;
  amount: string;
}

declare global {
  interface Window {
    walletAPI?: {
      getBalance: (address: string) => Promise<number>;
      getEthBalance: (address: string) => Promise<number>;
      getTokenBalances: (address: string) => Promise<Record<string, number>>;
      getSectionData: (section: string) => Promise<SectionRow[]>;
      generateMnemonic: () => Promise<string>;
      validateMnemonic: (mnemonic: string) => Promise<boolean>;
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
      send: (params: SendParams) => Promise<string>;
    };
  }
}

export {};
