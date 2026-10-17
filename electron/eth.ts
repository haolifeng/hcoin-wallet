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

/** BIP44 标准 ETH 派生路径（与 MetaMask 等主流钱包一致） */
export const ETH_DERIVE_PATH = "m/44'/60'/0'/0/0";

/**
 * 测试网（Sepolia）公共 RPC 节点，用于后台轮询查询 ETH 余额。
 * 可通过环境变量 ETH_TESTNET_RPC_URL 覆盖为自建/私有节点。
 */
export const ETH_TESTNET_NAME = 'Sepolia';
export const ETH_TESTNET_RPC_URL =
  process.env.ETH_TESTNET_RPC_URL ?? 'https://ethereum-sepolia-rpc.publicnode.com';

let provider: JsonRpcProvider | null = null;

/** 懒加载单例 JsonRpcProvider（staticNetwork 避免每次请求重复探测 chainId） */
function getProvider(): JsonRpcProvider {
  if (!provider) {
    provider = new JsonRpcProvider(ETH_TESTNET_RPC_URL, undefined, {
      staticNetwork: true,
    });
  }
  return provider;
}

/**
 * 查询测试网上某个 ETH 地址的余额，返回以 ETH 为单位的数值。
 * 注意：返回值为 number，仅用于界面展示；如需精确比较金额应使用 wei(BigInt)。
 */
export async function fetchEthBalance(address: string): Promise<number> {
  const wei = await getProvider().getBalance(address);
  return Number(formatEther(wei));
}

/** 测试网上已支持的 ERC-20 代币（Sepolia 地址与精度） */
export interface TokenConfig {
  /** 代币符号，同时作为数据库中余额的键 */
  symbol: string;
  /** 合约地址 */
  address: string;
  /** 代币精度（decimals） */
  decimals: number;
}

export const SUPPORTED_TOKENS: TokenConfig[] = [
  { symbol: 'USDT', address: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0', decimals: 6 },
  { symbol: 'USDC', address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', decimals: 6 },
];

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

/**
 * 查询测试网上某个 ERC-20 代币余额，返回按代币精度换算后的数值。
 * 注意：返回值为 number，仅用于界面展示。
 */
export async function fetchTokenBalance(owner: string, token: TokenConfig): Promise<number> {
  const contract = new Contract(token.address, ERC20_ABI, getProvider());
  const raw: bigint = await contract.balanceOf(owner);
  return Number(formatUnits(raw, token.decimals));
}

/** 按符号查找已支持的代币配置 */
export function getTokenBySymbol(symbol: string): TokenConfig {
  const token = SUPPORTED_TOKENS.find((t) => t.symbol === symbol);
  if (!token) throw new Error(`不支持的代币：${symbol}`);
  return token;
}

/**
 * 由助记词派生可签名的 HD 钱包（仅存于主进程内存，绝不回传渲染进程）。
 */
export function deriveWallet(mnemonic: string): HDNodeWallet {
  const phrase = mnemonic.trim().toLowerCase();
  if (!Mnemonic.isValidMnemonic(phrase)) {
    throw new Error('助记词不合法，无法派生 ETH 账户');
  }
  return HDNodeWallet.fromPhrase(phrase, undefined, ETH_DERIVE_PATH);
}

/**
 * 发送 ETH（含 gas 自动估算与费用填充）。
 * 返回交易哈希；余额不足、地址非法等错误由 ethers 抛出。
 */
export async function sendEth(wallet: HDNodeWallet, to: string, amount: string): Promise<string> {
  const signer = wallet.connect(getProvider());
  const tx = await signer.sendTransaction({
    to: getAddress(to),
    value: parseEther(amount),
  });
  return tx.hash;
}

/**
 * 发送 ERC-20 代币（USDT / USDC）。
 * 返回交易哈希；余额不足、地址非法等错误由 ethers 抛出。
 */
export async function sendToken(
  wallet: HDNodeWallet,
  symbol: string,
  to: string,
  amount: string,
): Promise<string> {
  const token = getTokenBySymbol(symbol);
  const signer = wallet.connect(getProvider());
  const contract = new Contract(token.address, ERC20_ABI, signer);
  const tx = await contract.transfer(getAddress(to), parseUnits(amount, token.decimals));
  return tx.hash;
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
   * 后续若需签名，应在主进程内重新派生使用。
   */
  privateKey: string;
}

/**
 * 由 BIP39 助记词派生 ETH 账户。
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
