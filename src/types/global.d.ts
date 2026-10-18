/** 界面语言 */
export type Locale = 'zh' | 'en';

/** 网络环境：主网 / 测试网 */
export type NetworkType = 'mainnet' | 'testnet';

/** 切换网络环境的返回：新网络 + 当前会话在该网络下的账户地址（未解锁时为 null） */
export interface SetNetworkResult {
  network: NetworkType;
  account: UnlockResult | null;
}

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
  /** 支付密码：由主进程校验，校验通过后才签名广播 */
  password: string;
}

declare global {
  interface Window {
    walletAPI?: {
      getLocale: () => Promise<Locale>;
      setLocale: (locale: Locale) => Promise<Locale>;
      getNetwork: () => Promise<NetworkType>;
      setNetwork: (network: NetworkType) => Promise<SetNetworkResult>;
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
          btcTestnetAddress?: string;
          solAddress?: string;
        }[]
      >;
      backupMnemonic: (address: string, password: string) => Promise<string>;
      hasMnemonic: () => Promise<MnemonicState>;
      unlockWallet: (address: string, password: string) => Promise<UnlockResult>;
      send: (params: SendParams) => Promise<string>;
      /** 手动锁定钱包（丢弃主进程内存中的私钥） */
      lock: () => Promise<boolean>;
      /** 订阅锁定事件，返回取消订阅函数 */
      onLocked: (callback: (reason: string) => void) => () => void;
    };
  }
}

export {};
