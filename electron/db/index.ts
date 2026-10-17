import { ClassicLevel } from 'classic-level';
import {
  createHash,
  randomBytes,
  scryptSync,
  createCipheriv,
  createDecipheriv,
} from 'node:crypto';
import path from 'node:path';
import { app } from 'electron';
import { generateMnemonic as generateBip39Mnemonic, validateMnemonic } from 'bip39';
import { deriveEthAccount } from '../chains';
import { deriveBtcAccount } from '../bitcoin';
import { deriveSolAccount } from '../solana';
import { getNetwork, type NetworkType } from '../network';

/** 助记词对称加密后的密文结构（只落盘密文，明文永不写入数据库） */
export interface EncryptedSecret {
  version: 1;
  algorithm: 'aes-256-gcm';
  kdf: 'scrypt';
  salt: string; // base64
  iv: string; // base64
  tag: string; // base64  GCM 认证标签
  ciphertext: string; // base64
  scrypt: { N: number; r: number; p: number };
}

/** scrypt 派生参数（N=16384, r=8, p=1 ≈ 16MB 内存，满足 Node 默认 maxmem） */
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 32;

/** 单条链的余额：原生代币 + 各 ERC-20 代币 */
export interface ChainBalance {
  /** 原生代币余额（ETH / AVAX） */
  native?: number;
  /** ERC-20 代币余额（symbol → 数值） */
  tokens?: Record<string, number>;
}

export interface Account {
  address: string;
  balance: number;
  createdAt: number;
  /** 各链余额（链 key → 余额），由主进程轮询测试网后写入，前台轮询读取展示 */
  chainBalances?: Record<string, ChainBalance>;
  /** @deprecated 旧版单链字段，启动时迁移到 chainBalances.eth */
  ethBalance?: number;
  /** @deprecated 旧版单链字段，启动时迁移到 chainBalances.eth */
  tokenBalances?: Record<string, number>;
  secret?: EncryptedSecret;
  /** 由助记词派生的账户地址（ETH 与 AVAX 共用），解锁/创建时写入，便于界面直接展示 */
  ethAddress?: string;
  /** 账户使用的 BIP44 派生路径 */
  ethPath?: string;
  /** 由助记词派生的 BTC 主网地址（BIP84 coinType 0），解锁/创建时写入 */
  btcAddress?: string;
  /** BTC 主网使用的 BIP84 派生路径 */
  btcPath?: string;
  /** 由助记词派生的 BTC 测试网地址（BIP84 coinType 1），解锁/创建时写入 */
  btcTestnetAddress?: string;
  /** BTC 测试网使用的 BIP84 派生路径 */
  btcTestnetPath?: string;
  /** 由助记词派生的 Solana 地址（SLIP-0010 Ed25519，主网/测试网一致），解锁/创建时写入 */
  solAddress?: string;
  /** 账户使用的 Solana 派生路径 */
  solPath?: string;
}

/** 取账户在指定网络环境下的 BTC 地址（缺失时回落到主网地址） */
export function resolveBtcAddress(
  account: Pick<Account, 'btcAddress' | 'btcTestnetAddress'>,
  network: NetworkType = getNetwork(),
): string | undefined {
  if (network === 'testnet') return account.btcTestnetAddress ?? account.btcAddress;
  return account.btcAddress;
}

/** 启动时检测结果：数据库里是否已经存在加密助记词 */
export interface MnemonicState {
  exists: boolean;
  /** 第一个（最早创建的）持有助记词的账户地址，供解锁窗口默认选中 */
  address: string | null;
}

/** 解锁结果：钱包账户地址 + 派生出的 ETH 地址（ETH/AVAX 共用） + BTC 地址 + Solana 地址 */
export interface UnlockResult {
  address: string;
  ethAddress: string;
  btcAddress: string;
  solAddress: string;
}

/** 中间内容区展示用的通用数据行 */
export interface SectionRow {
  key: string;
  [column: string]: string | number;
}

let db: ClassicLevel<string, Account>;

// 账户 KV 键前缀：account:<address>
const accountKey = (address: string) => `account:${address}`;

/**
 * 初始化 LevelDB（Key-Value 存储）。
 * 替代原先的 SQLite accounts 表：以 `account:<address>` 为 key，
 * value 为 { address, balance, createdAt }。
 */
export async function initDatabase(): Promise<void> {
  const dbPath = path.join(app.getPath('userData'), 'hcoin-wallet-leveldb');
  db = new ClassicLevel<string, Account>(dbPath, {
    valueEncoding: 'json',
    keyEncoding: 'utf8',
  });
  try {
    await db.open();
  } catch (err) {
    // 打印真正原因（LevelDB 底层错误在 err.cause 中）
    const cause = (err as { cause?: unknown })?.cause;
    console.error('[db] 打开 LevelDB 失败:', err);
    if (cause) console.error('[db] 底层原因:', cause);
    throw err;
  }

  // 不再写入任何演示数据：数据库为空时由启动流程弹出「创建 / 导入助记词」向导。
  // 顺带清理历史版本遗留的演示账户，保证老用户升级后空库也能正常走启动向导。
  const legacyDemoAddress = 'HC0xDEMO0001';
  if (await db.has(accountKey(legacyDemoAddress))) {
    await db.del(accountKey(legacyDemoAddress));
  }

  // 迁移历史账户地址格式：早期为 "HC0x…"，现统一为 "0x…"
  await migrateLegacyAddresses();

  // 迁移旧版单链余额字段到多链结构
  await migrateLegacyChainBalances();
}

/**
 * 迁移旧版单链余额字段（ethBalance / tokenBalances）到多链结构 chainBalances.eth。
 * 幂等：迁移后不再保留旧字段。
 */
async function migrateLegacyChainBalances(): Promise<void> {
  const pending: { key: string; account: Account }[] = [];
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith('account:')) continue;
    if (account.chainBalances) continue;
    if (account.ethBalance === undefined && account.tokenBalances === undefined) continue;
    pending.push({ key, account });
  }
  for (const { key, account } of pending) {
    const { ethBalance, tokenBalances, chainBalances, ...rest } = account;
    await db.put(key, {
      ...rest,
      chainBalances: chainBalances ?? {
        eth: { native: ethBalance ?? 0, tokens: tokenBalances ?? {} },
      },
    });
  }
  if (pending.length > 0) {
    console.log(`[db] 已迁移 ${pending.length} 个账户到多链余额结构`);
  }
}

/**
 * 迁移历史账户地址格式：把以 "HC" 开头的旧地址（键与 address 字段）改写为去掉 "HC" 的新格式。
 * 幂等：迁移后不再存在以 "HC" 开头的账户键。
 */
async function migrateLegacyAddresses(): Promise<void> {
  const legacy: { key: string; account: Account }[] = [];
  // 先收集再改写，避免在迭代过程中修改数据
  for await (const [key, account] of db.iterator()) {
    if (key.startsWith('account:HC')) {
      legacy.push({ key, account });
    }
  }
  for (const { key, account } of legacy) {
    const nextAddress = account.address.startsWith('HC')
      ? account.address.slice(2)
      : account.address;
    await db.put(accountKey(nextAddress), { ...account, address: nextAddress });
    await db.del(key);
  }
  if (legacy.length > 0) {
    console.log(`[db] 已迁移 ${legacy.length} 个历史账户地址格式（去除 HC 前缀）`);
  }
}

/**
 * 生成 12 个英文助记词（BIP39 标准词库，128 位熵）。
 * 在 Electron 主进程生成，词库不会进入渲染进程产物。
 */
export function generateMnemonic(): string {
  return generateBip39Mnemonic(128);
}

/** 校验助记词是否合法 */
export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic);
}

/** 由助记词派生账户地址：0x + sha256(助记词) 前 8 位大写十六进制 */
export function deriveAddress(mnemonic: string): string {
  return `0x${createHash('sha256').update(mnemonic).digest('hex').slice(0, 8).toUpperCase()}`;
}

/** scrypt 派生密钥 + AES-256-GCM 加密助记词 */
function encryptMnemonic(mnemonic: string, password: string): EncryptedSecret {
  const salt = randomBytes(16);
  const key = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(mnemonic, 'utf8'), cipher.final()]);
  return {
    version: 1,
    algorithm: 'aes-256-gcm',
    kdf: 'scrypt',
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    scrypt: SCRYPT_PARAMS,
  };
}

/**
 * 创建账户：加密助记词后写入 LevelDB，并同步派生 ETH 账户地址。
 * 仅返回钱包地址与 ETH 地址，明文助记词与密文都不会回传给渲染进程。
 */
export async function createAccount(
  mnemonic: string,
  password: string,
): Promise<UnlockResult> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法创建账户');
  }
  if (!isValidMnemonic(mnemonic)) {
    throw new Error('助记词不合法');
  }
  if (!password) {
    throw new Error('密码不能为空');
  }

  const address = deriveAddress(mnemonic);
  if (await db.has(accountKey(address))) {
    throw new Error('该账户已存在');
  }

  const secret = encryptMnemonic(mnemonic, password);
  // 助记词此刻仍是明文，趁此派生 ETH / BTC / SOL 账户；派生后不再持有明文引用。
  // BTC 主网与测试网的派生路径不同，两个地址都落库，切换网络时无需再次解密助记词
  const eth = deriveEthAccount(mnemonic);
  const btcMainnet = deriveBtcAccount(mnemonic, 'mainnet');
  const btcTestnet = deriveBtcAccount(mnemonic, 'testnet');
  const sol = deriveSolAccount(mnemonic);
  await db.put(accountKey(address), {
    address,
    balance: 0,
    createdAt: Date.now(),
    chainBalances: {},
    secret,
    ethAddress: eth.address,
    ethPath: eth.path,
    btcAddress: btcMainnet.address,
    btcPath: btcMainnet.path,
    btcTestnetAddress: btcTestnet.address,
    btcTestnetPath: btcTestnet.path,
    solAddress: sol.address,
    solPath: sol.path,
  });

  return {
    address,
    ethAddress: eth.address,
    btcAddress: getNetwork() === 'mainnet' ? btcMainnet.address : btcTestnet.address,
    solAddress: sol.address,
  };
}

/** 列出所有账户（地址 + 创建时间 + 是否含加密助记词 + EVM/BTC/SOL 地址，按创建时间升序） */
export async function listAccounts(): Promise<
  {
    address: string;
    createdAt: number;
    hasSecret: boolean;
    ethAddress?: string;
    /** BTC 主网地址 */
    btcAddress?: string;
    /** BTC 测试网地址 */
    btcTestnetAddress?: string;
    solAddress?: string;
  }[]
> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法读取账户列表');
  }
  const accounts: {
    address: string;
    createdAt: number;
    hasSecret: boolean;
    ethAddress?: string;
    btcAddress?: string;
    btcTestnetAddress?: string;
    solAddress?: string;
  }[] = [];
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith('account:')) continue;
    accounts.push({
      address: account.address,
      createdAt: account.createdAt,
      hasSecret: Boolean(account.secret),
      ethAddress: account.ethAddress,
      btcAddress: account.btcAddress,
      btcTestnetAddress: account.btcTestnetAddress,
      solAddress: account.solAddress,
    });
  }
  return accounts.sort((a, b) => a.createdAt - b.createdAt);
}

/**
 * 启动检测：数据库里是否已有加密助记词。
 * 存在时一并返回最早创建的那个账户地址，供解锁窗口默认选中。
 */
export async function hasMnemonic(): Promise<MnemonicState> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法检查助记词');
  }
  let first: { address: string; createdAt: number } | null = null;
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith('account:')) continue;
    if (!account.secret) continue;
    if (!first || account.createdAt < first.createdAt) {
      first = { address: account.address, createdAt: account.createdAt };
    }
  }
  return { exists: Boolean(first), address: first?.address ?? null };
}

/** 解锁会话：除回传渲染进程的结果外，附带明文助记词（仅供主进程内存使用） */
export interface UnlockSession {
  result: UnlockResult;
  /** 明文助记词——仅限主进程用于派生签名钱包，绝不回传渲染进程 */
  mnemonic: string;
}

/**
 * 解锁钱包：用密码解密助记词 → 派生 ETH/BTC 账户 → 持久化地址。
 * 明文助记词随返回值交予主进程建立签名会话，不会写入数据库或回传渲染进程；
 * 密码错误由 decryptMnemonic 抛出。
 */
export async function unlockAccountWithSigner(
  address: string,
  password: string,
): Promise<UnlockSession> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法解锁账户');
  }
  if (!address) {
    throw new Error('请选择要解锁的账户');
  }

  const mnemonic = await decryptMnemonic(address, password);
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) {
    throw new Error('账户不存在');
  }

  let updated = account;
  let ethAddress = account.ethAddress;
  if (!ethAddress) {
    // 历史账户（创建时尚未派生）在首次解锁时补派生并写回数据库
    const eth = deriveEthAccount(mnemonic);
    ethAddress = eth.address;
    updated = { ...updated, ethAddress, ethPath: eth.path };
  }
  // BTC 主网 / 测试网派生路径不同，两个地址都要补齐（历史账户在首次解锁时补派生）
  let btcAddress = account.btcAddress;
  if (!btcAddress) {
    const btc = deriveBtcAccount(mnemonic, 'mainnet');
    btcAddress = btc.address;
    updated = { ...updated, btcAddress, btcPath: btc.path };
  }
  let btcTestnetAddress = account.btcTestnetAddress;
  if (!btcTestnetAddress) {
    const btc = deriveBtcAccount(mnemonic, 'testnet');
    btcTestnetAddress = btc.address;
    updated = { ...updated, btcTestnetAddress, btcTestnetPath: btc.path };
  }
  let solAddress = account.solAddress;
  if (!solAddress) {
    const sol = deriveSolAccount(mnemonic);
    solAddress = sol.address;
    updated = { ...updated, solAddress, solPath: sol.path };
  }
  if (updated !== account) {
    await db.put(accountKey(address), updated);
  }

  // 回传当前网络环境下的 BTC 地址
  const currentBtcAddress =
    getNetwork() === 'mainnet' ? btcAddress : (btcTestnetAddress ?? btcAddress);

  return { result: { address, ethAddress, btcAddress: currentBtcAddress, solAddress }, mnemonic };
}

/**
 * 解锁钱包（只返回可回传渲染进程的地址信息）。
 */
export async function unlockAccount(address: string, password: string): Promise<UnlockResult> {
  return (await unlockAccountWithSigner(address, password)).result;
}

/**
 * 用密码解密指定账户的助记词。
 * 密码错误时 AES-GCM 的认证标签校验失败，统一转换为「密码错误」提示。
 */
export async function decryptMnemonic(address: string, password: string): Promise<string> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法备份');
  }
  if (!password) {
    throw new Error('密码不能为空');
  }

  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) {
    throw new Error('账户不存在');
  }
  if (!account.secret) {
    throw new Error('该账户没有可用于备份的加密助记词');
  }

  const { salt, iv, tag, ciphertext, scrypt: params } = account.secret;
  try {
    const key = scryptSync(password, Buffer.from(salt, 'base64'), KEY_LENGTH, params);
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    throw new Error('密码错误，无法解密助记词');
  }
}

/**
 * 按地址查询余额。账户不存在或数据库未就绪时返回 0。
 */
export async function queryBalance(address: string): Promise<number> {
  if (!db || db.status !== 'open') {
    console.warn('[db] queryBalance 调用时数据库尚未就绪');
      return 0;
    }
  try {
    const account = await db.get(accountKey(address));
    return account?.balance ?? 0;
  } catch (err: unknown) {
    // classic-level 在 key 不存在时抛出 LEVEL_NOT_FOUND
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'LEVEL_NOT_FOUND'
    ) {
      return 0;
  }
    throw err;
}
}

/**
 * 按钱包账户地址查询各链余额（链 key → 余额），供前台轮询展示。
 * 账户不存在或数据库未就绪时返回空对象。
 */
export async function queryChainBalances(
  address: string,
): Promise<Record<string, ChainBalance>> {
  if (!db || db.status !== 'open') {
    console.warn('[db] queryChainBalances 调用时数据库尚未就绪');
    return {};
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  return account?.chainBalances ?? {};
}

/**
 * 更新账户某条链的原生代币余额（后台轮询测试网后写入数据库）。
 * 账户不存在或数据库未就绪时静默跳过。
 */
export async function setChainNativeBalance(
  address: string,
  chainKey: string,
  native: number,
): Promise<void> {
  if (!db || db.status !== 'open') {
    console.warn('[db] setChainNativeBalance 调用时数据库尚未就绪');
    return;
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) return;
  const chainBalances = account.chainBalances ?? {};
  await db.put(accountKey(address), {
    ...account,
    chainBalances: {
      ...chainBalances,
      [chainKey]: { ...chainBalances[chainKey], native },
    },
  });
}

/**
 * 合并更新账户某条链的 ERC-20 代币余额（后台轮询测试网后写入数据库）。
 * 账户不存在或数据库未就绪时静默跳过。
 */
export async function setChainTokenBalances(
  address: string,
  chainKey: string,
  balances: Record<string, number>,
): Promise<void> {
  if (!db || db.status !== 'open') {
    console.warn('[db] setChainTokenBalances 调用时数据库尚未就绪');
    return;
  }
  const account = await db.get(accountKey(address)).catch(() => null);
  if (!account) return;
  const chainBalances = account.chainBalances ?? {};
  const chain = chainBalances[chainKey] ?? {};
  await db.put(accountKey(address), {
    ...account,
    chainBalances: {
      ...chainBalances,
      [chainKey]: { ...chain, tokens: { ...(chain.tokens ?? {}), ...balances } },
    },
  });
}

/**
 * 关闭数据库（应用退出时调用）。
 */
export async function closeDatabase(): Promise<void> {
  if (db && db.status === 'open') {
    await db.close();
  }
}

/**
 * 根据左侧菜单的分区 key，从数据库读取对应数据。
 * 演示：总揽 / 账户 / 余额 / 关于。
 */
export async function querySectionData(section: string): Promise<SectionRow[]> {
  if (!db || db.status !== 'open') {
    console.warn('[db] querySectionData 调用时数据库尚未就绪');
    return [];
  }

  switch (section) {
    case 'dashboard': {
      // 总揽：从数据库中聚合账户信息
      const rows: SectionRow[] = [];
      let total = 0;
      let count = 0;
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith('account:')) continue;
        total += account.balance;
        count += 1;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2),
          createdAt: new Date(account.createdAt).toLocaleString(),
        });
      }
      rows.push({
        key: '__summary__',
        address: `共 ${count} 个账户`,
        balance: total.toFixed(2),
        createdAt: '—',
      });
      return rows;
    }

    case 'accounts': {
      const rows: SectionRow[] = [];
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith('account:')) continue;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2),
          createdAt: new Date(account.createdAt).toLocaleString(),
        });
      }
      return rows;
    }

    case 'balance': {
      // 余额：仅展示地址与余额
      const rows: SectionRow[] = [];
      for await (const [key, account] of db.iterator()) {
        if (!key.startsWith('account:')) continue;
        rows.push({
          key,
          address: account.address,
          balance: account.balance.toFixed(2),
        });
      }
      return rows;
    }

    case 'about': {
      const mainnet = getNetwork() === 'mainnet';
      return [
        { key: 'name', item: '钱包名称', value: 'HCoinWallet' },
        {
          key: 'net',
          item: '网络环境',
          value: mainnet
            ? '主网 (Ethereum / Avalanche / Bitcoin / Solana)'
            : '测试网 (Sepolia / Fuji / Bitcoin Testnet / Solana Devnet)',
        },
        { key: 'ver', item: '客户端版本', value: 'v0.0.1' },
        { key: 'db', item: '数据存储', value: 'LevelDB (classic-level)' },
      ];
    }

    default:
      return [];
  }
}

