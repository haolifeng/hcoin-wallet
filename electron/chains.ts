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
import { getNetwork, type NetworkType } from './network';

/** BIP44 标准 EVM 派生路径（ETH 与 AVAX C-Chain 的地址一致，主网/测试网共用） */
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
  /** 网络名称，随网络环境变化，如 'Sepolia' / 'Ethereum' */
  name: string;
  /** 原生代币符号，如 'ETH' / 'AVAX' / 'BTC' */
  nativeSymbol: string;
  /** 区块浏览器交易地址前缀 */
  explorerTxUrl: string;
  /** 追加在交易哈希之后的查询参数（如 Solana devnet 的 ?cluster=devnet） */
  explorerTxSuffix?: string;
}

/** EVM 兼容链（ETH / AVAX） */
export interface EvmChainConfig extends BaseChainConfig {
  kind: 'evm';
  /** RPC 节点 */
  rpcUrl: string;
  /** 该链支持的 ERC-20 代币 */
  tokens: TokenConfig[];
}

/** 比特币链——余额/发送由 bitcoin.ts 通过 REST API 处理 */
export interface BtcChainConfig extends BaseChainConfig {
  kind: 'bitcoin';
  /** BTC 无 ERC-20 代币，固定为空 */
  tokens: [];
}

/** Solana 链——余额/发送由 solana.ts 通过 JSON-RPC 处理 */
export interface SolChainConfig extends BaseChainConfig {
  kind: 'solana';
  /** SOL 无 ERC-20 代币，固定为空 */
  tokens: [];
}

/** 一条链的配置（判别联合，按 kind 区分处理逻辑） */
export type ChainConfig = EvmChainConfig | BtcChainConfig | SolChainConfig;

/** EVM 链在某个网络环境下的配置 */
type EvmNetworkConfig = Omit<EvmChainConfig, 'key' | 'kind' | 'nativeSymbol'>;
/** BTC / SOL 链在某个网络环境下的配置 */
type PlainNetworkConfig = Omit<BtcChainConfig, 'key' | 'kind' | 'nativeSymbol'>;

interface EvmChainDef {
  key: string;
  kind: 'evm';
  nativeSymbol: string;
  networks: Record<NetworkType, EvmNetworkConfig>;
}

interface BtcChainDef {
  key: string;
  kind: 'bitcoin';
  nativeSymbol: string;
  networks: Record<NetworkType, PlainNetworkConfig>;
}

interface SolChainDef {
  key: string;
  kind: 'solana';
  nativeSymbol: string;
  networks: Record<NetworkType, PlainNetworkConfig>;
}

/** 一条链的定义：与网络无关的部分 + 各网络环境的差异部分 */
type ChainDef = EvmChainDef | BtcChainDef | SolChainDef;

/**
 * 已支持的链及其主网 / 测试网配置。
 * ETH：Ethereum ↔ Sepolia；AVAX：Avalanche ↔ Fuji；
 * BTC：Bitcoin ↔ Bitcoin Testnet3；SOL：Solana ↔ Solana Devnet。
 * RPC 可通过环境变量覆盖。
 */
const CHAIN_DEFS: ChainDef[] = [
  {
    key: 'eth',
    kind: 'evm',
    nativeSymbol: 'ETH',
    networks: {
      mainnet: {
        name: 'Ethereum',
        rpcUrl: process.env.ETH_MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
        explorerTxUrl: 'https://etherscan.io/tx/',
        tokens: [
          { symbol: 'USDT', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
          { symbol: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
        ],
      },
      testnet: {
        name: 'Sepolia',
        rpcUrl: process.env.ETH_TESTNET_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com',
        explorerTxUrl: 'https://sepolia.etherscan.io/tx/',
        tokens: [
          { symbol: 'USDT', address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6 },
          { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
        ],
      },
    },
  },
  {
    key: 'avax',
    kind: 'evm',
    nativeSymbol: 'AVAX',
    networks: {
      mainnet: {
        name: 'Avalanche',
        rpcUrl: process.env.AVAX_MAINNET_RPC_URL ?? 'https://avalanche-c-chain-rpc.publicnode.com',
        explorerTxUrl: 'https://snowtrace.io/tx/',
        tokens: [
          { symbol: 'USDT', address: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', decimals: 6 },
          { symbol: 'USDC', address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', decimals: 6 },
        ],
      },
      testnet: {
        name: 'Fuji',
        rpcUrl: process.env.AVAX_TESTNET_RPC_URL ?? 'https://api.avax-test.network/ext/bc/C/rpc',
        explorerTxUrl: 'https://testnet.snowtrace.io/tx/',
        tokens: [
          { symbol: 'USDT', address: '0xAb231A5744C8E6c45481754928cCfFFFD4aa0732', decimals: 6 },
          { symbol: 'USDC', address: '0x5425890298aed601595a70AB815c96711a31Bc65', decimals: 6 },
        ],
      },
    },
  },
  {
    key: 'btc',
    kind: 'bitcoin',
    nativeSymbol: 'BTC',
    networks: {
      mainnet: { name: 'Bitcoin', explorerTxUrl: 'https://mempool.space/tx/', tokens: [] },
      testnet: {
        name: 'Bitcoin Testnet',
        explorerTxUrl: 'https://mempool.space/testnet/tx/',
        tokens: [],
      },
    },
  },
  {
    key: 'sol',
    kind: 'solana',
    nativeSymbol: 'SOL',
    networks: {
      mainnet: { name: 'Solana', explorerTxUrl: 'https://explorer.solana.com/tx/', tokens: [] },
      testnet: {
        name: 'Solana Devnet',
        explorerTxUrl: 'https://explorer.solana.com/tx/',
        explorerTxSuffix: '?cluster=devnet',
        tokens: [],
      },
    },
  },
];

/** 按链定义 + 网络环境生成该链的完整配置 */
function buildChainConfig(def: ChainDef, network: NetworkType): ChainConfig {
  const base = {
    key: def.key,
    nativeSymbol: def.nativeSymbol,
    name: def.networks[network].name,
    explorerTxUrl: def.networks[network].explorerTxUrl,
    explorerTxSuffix: def.networks[network].explorerTxSuffix,
  };
  switch (def.kind) {
    case 'evm': {
      const net = def.networks[network];
      return { ...base, kind: 'evm', rpcUrl: net.rpcUrl, tokens: net.tokens };
    }
    case 'bitcoin':
      return { ...base, kind: 'bitcoin', tokens: [] };
    case 'solana':
      return { ...base, kind: 'solana', tokens: [] };
  }
}

/**
 * 当前网络环境下已支持的链。
 * 网络切换后调用方需重新取值，旧的配置（RPC / 代币合约）不可再用。
 */
export function getSupportedChains(network: NetworkType = getNetwork()): ChainConfig[] {
  return CHAIN_DEFS.map((def) => buildChainConfig(def, network));
}

/** 按链 key 获取配置，未知链直接抛错 */
export function getChain(chainKey: string, network: NetworkType = getNetwork()): ChainConfig {
  const chain = getSupportedChains(network).find((c) => c.key === chainKey);
  if (!chain) throw new Error(`不支持的链：${chainKey}`);
  return chain;
}

/** 按链 key 获取 EVM 链配置，非 EVM 链直接抛错 */
export function getEvmChain(
  chainKey: string,
  network: NetworkType = getNetwork(),
): EvmChainConfig {
  const chain = getChain(chainKey, network);
  if (chain.kind !== 'evm') throw new Error(`链 ${chain.name} 不是 EVM 链`);
  return chain;
}

/** 按链获取代币配置 */
export function getToken(chain: EvmChainConfig, symbol: string): TokenConfig {
  const token = chain.tokens.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`链 ${chain.name} 不支持代币：${symbol}`);
  return token;
}

/** 缓存键包含网络环境，切换网络后不会复用旧 RPC 连接 */
const providers = new Map<string, JsonRpcProvider>();

/** 懒加载各链的单例 JsonRpcProvider（staticNetwork 避免重复探测 chainId） */
function getProvider(chain: EvmChainConfig, network: NetworkType = getNetwork()): JsonRpcProvider {
  const cacheKey = `${network}:${chain.key}`;
  let provider = providers.get(cacheKey);
  if (!provider) {
    provider = new JsonRpcProvider(chain.rpcUrl, undefined, { staticNetwork: true });
    providers.set(cacheKey, provider);
  }
  return provider;
}

/** 切换网络环境后释放全部 RPC 连接，下次使用会按新网络重新建立 */
export function resetChainProviders(): void {
  for (const provider of providers.values()) {
    provider.destroy();
  }
  providers.clear();
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

/**
 * 由助记词派生可签名的 HD 钱包（仅存于主进程内存，绝不回传渲染进程）。
 * ETH 与 AVAX 为 EVM 兼容链，共用同一地址（主网 / 测试网地址一致）。
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
