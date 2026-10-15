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

export interface Account {
  address: string;
  balance: number;
  createdAt: number;
  secret?: EncryptedSecret;
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

  // 插入演示数据（幂等）
  const demoAddress = 'HC0xDEMO0001';
  if (!(await db.has(accountKey(demoAddress)))) {
    await db.put(accountKey(demoAddress), {
      address: demoAddress,
      balance: 1234.56,
      createdAt: Date.now(),
    });
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

/** 由助记词派生地址：HC0x + sha256(助记词) 前 8 位大写十六进制 */
export function deriveAddress(mnemonic: string): string {
  return `HC0x${createHash('sha256').update(mnemonic).digest('hex').slice(0, 8).toUpperCase()}`;
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
 * 创建账户：加密助记词后写入 LevelDB。
 * 仅返回地址，明文助记词与密文都不会回传给渲染进程。
 */
export async function createAccount(
  mnemonic: string,
  password: string,
): Promise<{ address: string }> {
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
  await db.put(accountKey(address), {
    address,
    balance: 0,
    createdAt: Date.now(),
    secret,
  });

  return { address };
}

/** 列出所有账户（地址 + 创建时间 + 是否含加密助记词，按创建时间升序） */
export async function listAccounts(): Promise<
  { address: string; createdAt: number; hasSecret: boolean }[]
> {
  if (!db || db.status !== 'open') {
    throw new Error('数据库尚未就绪，无法读取账户列表');
  }
  const accounts: { address: string; createdAt: number; hasSecret: boolean }[] = [];
  for await (const [key, account] of db.iterator()) {
    if (!key.startsWith('account:')) continue;
    accounts.push({
      address: account.address,
      createdAt: account.createdAt,
      hasSecret: Boolean(account.secret),
    });
  }
  return accounts.sort((a, b) => a.createdAt - b.createdAt);
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
      return [
        { key: 'name', item: '钱包名称', value: 'HCoinWallet' },
        { key: 'net', item: '网络环境', value: '主网 (Mainnet)' },
        { key: 'ver', item: '客户端版本', value: 'v0.0.1' },
        { key: 'db', item: '数据存储', value: 'LevelDB (classic-level)' },
      ];
    }

    default:
      return [];
  }
}

