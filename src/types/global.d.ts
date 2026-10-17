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
  /** EVM 地址（ETH / AVAX 共用） */
  ethAddress: string;
  /** BTC 主网地址（BIP84 Native SegWit） */
  btcAddress: string;
  /** Solana 主网地址（SLIP-0010 Ed25519） */
  solAddress: string;
}

/** 单条链的余额：原生代币 + 各 ERC-20 代币 */
export interface ChainBalance {
  /** 原生代币余额（ETH / AVAX） */
  native?: number;
  /** ERC-20 代币余额（symbol → 数值） */
  tokens?: Record<string, number>;
}

/** 各链余额（链 key → 余额） */
export type ChainBalances = Record<string, ChainBalance>;

/** 发送交易参数 */
export interface SendParams {
  address: string;
  /** 链 key，如 'eth' / 'avax' / 'btc' / 'sol' */
  chain: string;
  /** 资产符号：ETH / AVAX / BTC / SOL / USDT / USDC */
  asset: string;
  to: string;
  amount: string;
}

declare global {
  interface Window {
    walletAPI?: {
      getBalance: (address: string) => Promise<number>;
      getChainBalances: (address: string) => Promise<ChainBalances>;
      getSectionData: (section: string) => Promise<SectionRow[]>;
      generateMnemonic: () => Promise<string>;
      validateMnemonic: (mnemonic: string) => Promise<boolean>;
      createAccount: (
        mnemonic: string,
        password: string,
      ) => Promise<UnlockResult>;
      listAccounts: () => Promise<
        {
          address: string;
          createdAt: number;
          hasSecret: boolean;
          ethAddress?: string;
          btcAddress?: string;
          solAddress?: string;
        }[]
      >;
      backupMnemonic: (address: string, password: string) => Promise<string>;
      hasMnemonic: () => Promise<MnemonicState>;
      unlockWallet: (address: string, password: string) => Promise<UnlockResult>;
      send: (params: SendParams) => Promise<string>;
    };
  }
}

export {};
