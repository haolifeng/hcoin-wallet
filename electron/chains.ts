import {
  HDNodeWallet,
  Mnemonic,
  JsonRpcProvider,
  Contract,
  formatEther,
  formatUnits,
  getAddress,
  parseEther,
  parseUnits,
} from 'ethers';

/** BIP44 标准 EVM 派生路径（ETH 与 AVAX C-Chain 的地址一致） */
export const ETH_DERIVE_PATH = "m/44'/60'/0'/0/0";

/** 测试网上已支持的 ERC-20 代币（合约地址与精度） */
export interface TokenConfig {
  /** 代币符号，同时作为数据库中余额的键 */
  symbol: string;
  /** 合约地址 */
  address: string;
  /** 代币精度（decimals） */
  decimals: number;
}

/** 所有链共有字段 */
interface BaseChainConfig {
  /** 链标识，如 'eth' / 'avax' / 'btc'，作为数据库中余额的键 */
  key: string;
  /** 网络名称，如 'Sepolia' / 'Fuji' / 'Bitcoin' */
  name: string;
  /** 原生代币符号，如 'ETH' / 'AVAX' / 'BTC' */
  nativeSymbol: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
}

/** EVM 兼容链（ETH / AVAX） */
export interface EvmChainConfig extends BaseChainConfig {
  kind: 'evm';
  /** RPC 节点 */
  rpcUrl: string;
  /** 该链支持的 ERC-20 代币 */
  tokens: TokenConfig[];
}

/** 比特币链（主网）——余额/发送由 bitcoin.ts 通过 REST API 处理 */
export interface BtcChainConfig extends BaseChainConfig {
  kind: 'bitcoin';
  /** BTC 无 ERC-20 代币，固定为空 */
  tokens: [];
}

/** Solana 链（主网）——余额/发送由 solana.ts 通过 JSON-RPC 处理 */
export interface SolChainConfig extends BaseChainConfig {
  kind: 'solana';
  /** SOL 无 ERC-20 代币，固定为空 */
  tokens: [];
}

/** 一条链的配置（判别联合，按 kind 区分处理逻辑） */
export type ChainConfig = EvmChainConfig | BtcChainConfig | SolChainConfig;

/**
 * 已支持的链。ETH 走 Sepolia、AVAX 走 Fuji（测试网），BTC 走主网。
 * RPC / API 可通过环境变量覆盖。
 */
export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    kind: 'evm',
    key: 'eth',
    name: 'Sepolia',
    nativeSymbol: 'ETH',
    rpcUrl: process.env.ETH_TESTNET_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerTxUrl: 'https://sepolia.etherscan.io/tx/',
    tokens: [
      { symbol: 'USDT', address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6 },
      { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
    ],
  },
  {
    kind: 'evm',
    key: 'avax',
    name: 'Fuji',
    nativeSymbol: 'AVAX',
    rpcUrl: process.env.AVAX_TESTNET_RPC_URL ?? 'https://api.avax-test.network/ext/bc/C/rpc',
    explorerTxUrl: 'https://testnet.snowtrace.io/tx/',
    tokens: [
      { symbol: 'USDT', address: '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732', decimals: 6 },
      { symbol: 'USDC', address: '0x5425890298aed601595a70AB815c96711a31Bc65', decimals: 6 },
    ],
  },
  {
    kind: 'bitcoin',
    key: 'btc',
    name: 'Bitcoin',
    nativeSymbol: 'BTC',
    explorerTxUrl: 'https://mempool.space/tx/',
    tokens: [],
  },
  {
    kind: 'solana',
    key: 'sol',
    name: 'Solana',
    nativeSymbol: 'SOL',
    explorerTxUrl: 'https://explorer.solana.com/tx/',
    tokens: [],
  },
];

const providers = new Map<string, JsonRpcProvider>();

/** 按链 key 获取配置，未知链直接抛错 */
export function getChain(chainKey: string): ChainConfig {
  const chain = SUPPORTED_CHAINS.find((c) => c.key === chainKey);
  if (!chain) throw new Error(`不支持的链：${chainKey}`);
  return chain;
}

/** 按链 key 获取 EVM 链配置，非 EVM 链直接抛错 */
export function getEvmChain(chainKey: string): EvmChainConfig {
  const chain = getChain(chainKey);
  if (chain.kind !== 'evm') throw new Error(`链 ${chain.name} 不是 EVM 链`);
  return chain;
}

/** 按链获取代币配置 */
export function getToken(chain: EvmChainConfig, symbol: string): TokenConfig {
  const token = chain.tokens.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`链 ${chain.name} 不支持代币：${symbol}`);
  return token;
}

/** 懒加载各链的单例 JsonRpcProvider（staticNetwork 避免重复探测 chainId） */
function getProvider(chain: EvmChainConfig): JsonRpcProvider {
  let provider = providers.get(chain.key);
  if (!provider) {
    provider = new JsonRpcProvider(chain.rpcUrl, undefined, { staticNetwork: true });
    providers.set(chain.key, provider);
  }
  return provider;
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

/**
 * 由助记词派生可签名的 HD 钱包（仅存于主进程内存，绝不回传渲染进程）。
 * ETH 与 AVAX 为 EVM 兼容链，共用同一地址。
 */
export function deriveWallet(mnemonic: string): HDNodeWallet {
  const phrase = mnemonic.trim().toLowerCase();
  if (!Mnemonic.isValidMnemonic(phrase)) {
    throw new Error('助记词不合法，无法派生 ETH 账户');
  }
  return HDNodeWallet.fromPhrase(phrase, undefined, ETH_DERIVE_PATH);
}

export interface EthAccount {
  /** EIP-55 校验和地址，如 0xAbC… */
  address: string;
  /** 压缩公钥（十六进制） */
  publicKey: string;
  /** 派生路径 */
  path: string;
  /**
   * 私钥仅存在于主进程内存中，绝不落盘、绝不通过 IPC 回传渲染进程。
   */
  privateKey: string;
}

/**
 * 由 BIP39 助记词派生账户。
 * 解密后的明文助记词只在主进程内短暂存在，派生完成即随函数返回被回收。
 */
export function deriveEthAccount(mnemonic: string): EthAccount {
  const wallet = deriveWallet(mnemonic);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    path: ETH_DERIVE_PATH,
    privateKey: wallet.privateKey,
  };
}

/**
 * 查询某链上某个地址的原生代币余额（ETH / AVAX），返回以主币为单位的数值。
 * 注意：返回值为 number，仅用于界面展示；精确比较金额应使用 wei(BigInt)。
 */
export async function fetchNativeBalance(chainKey: string, address: string): Promise<number> {
  const chain = getEvmChain(chainKey);
  const wei = await getProvider(chain).getBalance(address);
  return Number(formatEther(wei));
}

/**
 * 查询某链上某个 ERC-20 代币余额，返回按代币精度换算后的数值。
 */
export async function fetchChainTokenBalance(
  chainKey: string,
  owner: string,
  symbol: string,
): Promise<number> {
  const chain = getEvmChain(chainKey);
  const token = getToken(chain, symbol);
  const contract = new Contract(token.address, ERC20_ABI, getProvider(chain));
  const raw: bigint = await contract.balanceOf(owner);
  return Number(formatUnits(raw, token.decimals));
}

/**
 * 在某链上发送原生代币（ETH / AVAX），含 gas 自动估算与费用填充。
 * 返回交易哈希；余额不足、地址非法等错误由 ethers 抛出。
 */
export async function sendNative(
  chainKey: string,
  wallet: HDNodeWallet,
  to: string,
  amount: string,
): Promise<string> {
  const chain = getEvmChain(chainKey);
  const signer = wallet.connect(getProvider(chain));
  const tx = await signer.sendTransaction({
    to: getAddress(to),
    value: parseEther(amount),
  });
  return tx.hash;
}

/**
 * 在某链上发送 ERC-20 代币（USDT / USDC）。
 * 返回交易哈希；余额不足、地址非法等错误由 ethers 抛出。
 */
export async function sendChainToken(
  chainKey: string,
  wallet: HDNodeWallet,
  symbol: string,
  to: string,
  amount: string,
): Promise<string> {
  const chain = getEvmChain(chainKey);
  const token = getToken(chain, symbol);
  const signer = wallet.connect(getProvider(chain));
  const contract = new Contract(token.address, ERC20_ABI, signer);
  const tx = await contract.transfer(getAddress(to), parseUnits(amount, token.decimals));
  return tx.hash;
}
