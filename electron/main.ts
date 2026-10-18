import {
  app,
  BrowserWindow,
  ipcMain,
  powerMonitor,
  shell,
  type IpcMainInvokeEvent,
} from 'electron';
import path from 'node:path';
import {
  initDatabase,
  queryBalance,
  queryChainBalances,
  querySectionData,
  generateMnemonic,
  isValidMnemonic,
  createAccount,
  listAccounts,
  decryptMnemonic,
  hasMnemonic,
  unlockAccountWithSigner,
  verifyPassword,
  closeDatabase,
  type UnlockResult,
} from './db';
import { startEthBalancePolling, stopEthBalancePolling, pollEthBalancesOnce } from './balance-poller';
import {
  deriveWallet,
  getChain,
  sendNative,
  sendChainToken,
  resetChainProviders,
} from './chains';
import { deriveBtcAccount, sendBtc } from './bitcoin';
import { deriveSolAccount, sendSol, resetSolConnections } from './solana';
import { loadNetwork, setNetwork, getNetwork, type NetworkType } from './network';
import { loadLocale, setLocale, getLocale, t, type Locale } from './locale';
import {
  setActiveWallet,
  getActiveWallet,
  getActiveBtcAccount,
  clearActiveWallet,
  lockWallet,
  setLockListener,
} from './session';
import {
  assertAuthAllowed,
  assertStrongPassword,
  assertTrustedSender,
  recordAuthFailure,
  resetAuthFailures,
} from './security';

/** 发送请求参数 */
interface SendParams {
  /** 钱包账户地址（数据库键） */
  address: string;
  /** 链 key，如 'eth' / 'avax' */
  chain: string;
  /** 资产符号：原生代币或 ERC-20 代币，如 ETH / AVAX / BTC / SOL / USDT / USDC */
  asset: string;
  to: string;
  amount: string;
  /** 支付密码：签名前由主进程校验 */
  password: string;
}

/** 空闲自动锁定时间（毫秒）：5 分钟无系统输入即丢弃内存中的签名材料 */
const IDLE_LOCK_MS = 5 * 60_000;
/** 空闲检查间隔（毫秒） */
const IDLE_CHECK_INTERVAL_MS = 30_000;

/** 允许用系统浏览器打开的外部域名白名单（区块浏览器） */
const ALLOWED_EXTERNAL_HOSTS = new Set([
  'etherscan.io',
  'sepolia.etherscan.io',
  'snowtrace.io',
  'testnet.snowtrace.io',
  'mempool.space',
  'explorer.solana.com',
]);

let mainWindow: BrowserWindow | null = null;
let idleTimer: NodeJS.Timeout | null = null;

/** 只允许把白名单内的 https 链接交给系统浏览器，避免应用内出现任意页面 */
function openExternalSafe(rawUrl: string): void {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== 'https:') return;
    if (!ALLOWED_EXTERNAL_HOSTS.has(url.hostname)) return;
    void shell.openExternal(url.toString());
  } catch {
    // 非法 URL 直接忽略
  }
}

/** 统一注册 IPC：所有通道先校验调用方来源（防止非本应用页面调用钱包接口） */
function handle(
  channel: string,
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => unknown,
): void {
  ipcMain.handle(channel, (event, ...args) => {
    assertTrustedSender(event);
    return handler(event, ...args);
  });
}

/** 启动空闲锁定检查（系统级空闲时间，不受页面内活动伪造影响） */
function startAutoLock(): void {
  stopAutoLock();
  idleTimer = setInterval(() => {
    if (!getActiveWallet()) return;
    if (powerMonitor.getSystemIdleTime() * 1000 >= IDLE_LOCK_MS) {
      lockWallet('idle');
    }
  }, IDLE_CHECK_INTERVAL_MS);
}

function stopAutoLock(): void {
  if (idleTimer) {
    clearInterval(idleTimer);
    idleTimer = null;
  }
}

// 锁定后通知渲染进程回到解锁界面（主进程是唯一可信的锁定来源）
setLockListener((reason) => {
  console.log(`[main] 钱包已锁定：${reason}`);
  mainWindow?.webContents.send('wallet:locked', reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,     // 安全：隔离上下文
      nodeIntegration: false,     // 安全：禁用渲染进程 Node
      sandbox: true,              // 安全：显式开启渲染进程沙箱
      webSecurity: true,          // 安全：保持同源策略
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged,  // 安全：生产禁用 DevTools（避免物理接触者读取内存数据）
      spellcheck: false,
    },
  });

  // 安全：禁止应用内打开新窗口；外部链接仅白名单域名交给系统浏览器
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    openExternalSafe(url);
    return { action: 'deny' };
  });

  // 安全：阻止页面导航离开应用自身页面
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl && url.startsWith(devUrl)) return;
    event.preventDefault();
    openExternalSafe(url);
  });

  // 安全：禁用 webview 标签
  mainWindow.webContents.on('will-attach-webview', (event) => {
    event.preventDefault();
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口关闭后释放引用，确保进程能正常退出
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 单实例锁：避免两个进程同时打开同一个 LevelDB（会导致锁冲突甚至数据损坏）
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });
}

// 应用启动时初始化数据库
app.whenReady().then(async () => {
  if (!gotSingleInstanceLock) return;

  try {
  await initDatabase();
  } catch (err) {
    // 数据库初始化失败不应导致应用静默崩溃
    console.error('[main] 数据库初始化失败，应用将以只读/无数据方式继续运行:', err);
  }

  // 恢复上次选择的语言（影响主进程抛出的错误提示文案）
  await loadLocale();

  // 恢复上次选择的网络环境（主网 / 测试网），必须在任何链操作之前完成
  const network = await loadNetwork();
  console.log(`[main] 当前网络环境：${network === 'mainnet' ? '主网' : '测试网'}`);

  createWindow();

  // 安全：空闲超时 / 系统锁屏 / 休眠时丢弃内存中的私钥，强制重新输入密码
  startAutoLock();
  powerMonitor.on('lock-screen', () => lockWallet('screen-lock'));
  powerMonitor.on('suspend', () => lockWallet('suspend'));

  // 后台轮询当前网络环境下各链余额并写入数据库，供渲染进程查询
  startEthBalancePolling();

  // IPC：读取当前语言
  handle('wallet:getLocale', () => {
    return getLocale();
  });

  // IPC：切换语言（主进程错误提示同样需要本地化）
  handle('wallet:setLocale', async (_event, next: Locale) => {
    return setLocale(next);
  });

  // IPC：读取当前网络环境
  handle('wallet:getNetwork', () => {
    return getNetwork();
  });

  // IPC：切换网络环境（主网 ↔ 测试网）。
  // 切换后释放旧的 RPC 连接、按新网络重新轮询余额，并回传新的 BTC 地址（主网 / 测试网派生路径不同）
  handle('wallet:setNetwork', async (_event, next: NetworkType) => {
    const applied = await setNetwork(next);
    resetChainProviders();
    resetSolConnections();
    void pollEthBalancesOnce();

    const active = getActiveWallet();
    if (!active) return { network: applied, account: null };
    const btc = getActiveBtcAccount();
    const account: UnlockResult = {
      address: active.address,
      ethAddress: active.wallet.address,
      btcAddress: btc?.address ?? '',
      solAddress: active.sol.address,
    };
    return { network: applied, account };
  });

  // IPC：渲染进程请求余额
  handle('wallet:getBalance', (_event, address: string) => {
    return queryBalance(address);
  });

  // IPC：渲染进程轮询请求各链余额（链 key → { native, tokens }）
  handle('wallet:getChainBalances', (_event, address: string) => {
    return queryChainBalances(address);
  });

  // IPC：渲染进程请求左侧菜单对应分区的数据
  handle('wallet:getSectionData', (_event, section: string) => {
    return querySectionData(section);
  });

  // IPC：生成 12 个助记词（BIP39 英文词库，词库不进入渲染进程产物）
  handle('wallet:generateMnemonic', () => {
    return generateMnemonic();
  });

  // IPC：校验助记词是否合法（导入助记词时使用，词库只在主进程）
  handle('wallet:validateMnemonic', (_event, mnemonic: string) => {
    return isValidMnemonic(mnemonic);
  });

  // IPC：创建账户（助记词 + 密码 → 主进程加密后写入 LevelDB，仅回传地址）
  // 创建与导入共用：导入时传入的是用户已有的助记词，同样加密落盘并派生 ETH 账户
  handle('wallet:createAccount', async (_event, mnemonic: string, password: string) => {
    // 安全：密码强度由主进程裁决，避免绕过界面直接写入弱密码
    assertStrongPassword(password);
    const result = await createAccount(mnemonic, password);
    // 建立签名会话（EVM + BTC + SOL 私钥仅存于主进程内存），随后立即触发一次余额轮询。
    // BTC 主网 / 测试网派生路径不同，两个账户都派生并缓存，切换网络时无需重新解密
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      { mainnet: deriveBtcAccount(mnemonic, 'mainnet'), testnet: deriveBtcAccount(mnemonic, 'testnet') },
      deriveSolAccount(mnemonic),
    );
    void pollEthBalancesOnce();
    return result;
  });

  // IPC：账户列表（备份时选择要备份的账户）
  handle('wallet:listAccounts', () => {
    return listAccounts();
  });

  // IPC：备份助记词（用密码解密数据库中保存的密文，仅在用户输入正确密码后回传明文）
  handle('wallet:backupMnemonic', async (_event, address: string, password: string) => {
    assertAuthAllowed();
    try {
      const phrase = await decryptMnemonic(address, password);
      resetAuthFailures();
      return phrase;
    } catch (err) {
      recordAuthFailure();
      throw err;
    }
  });

  // IPC：启动检测——数据库里是否已存在加密助记词
  handle('wallet:hasMnemonic', () => {
    return hasMnemonic();
  });

  // IPC：解锁钱包（密码 → 解密助记词 → 派生 ETH 账户；私钥仅存于主进程内存）
  handle('wallet:unlockWallet', async (_event, address: string, password: string) => {
    assertAuthAllowed();
    let session: Awaited<ReturnType<typeof unlockAccountWithSigner>>;
    try {
      session = await unlockAccountWithSigner(address, password);
    } catch (err) {
      // 安全：累计失败次数，超过阈值后指数退避，阻断在线暴力破解
      recordAuthFailure();
      throw err;
    }
    resetAuthFailures();

    const { result, mnemonic } = session;
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      { mainnet: deriveBtcAccount(mnemonic, 'mainnet'), testnet: deriveBtcAccount(mnemonic, 'testnet') },
      deriveSolAccount(mnemonic),
    );
    return result;
  });

  // IPC：发送交易（原生代币 ETH / AVAX，或 ERC-20 USDT / USDC）。
  // 私钥只在主进程内用于签名，不落盘、不回传
  handle('wallet:send', async (_event, params: SendParams) => {
    const { address, chain: chainKey, asset, to, amount, password } =
      params ?? ({} as SendParams);
    const active = getActiveWallet();
    if (!active) throw new Error(t('err.walletLocked'));
    if (active.address !== address) throw new Error(t('err.accountMismatch'));
    if (!to?.trim()) throw new Error(t('err.enterRecipient'));

    // 安全：签名前必须再次验证支付密码。这样即使渲染进程被注入脚本、
    // 会话被劫持或 UI 被伪造，攻击者也无法在用户不知情时转走资产。
    if (!password) throw new Error(t('err.enterPassword'));
    assertAuthAllowed();
    if (!(await verifyPassword(address, password))) {
      recordAuthFailure();
      throw new Error(t('err.wrongPassword'));
    }
    resetAuthFailures();

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error(t('err.amountPositive'));

    const chain = getChain(chainKey);
    let txHash: string;
    if (chain.kind === 'bitcoin') {
      if (asset !== chain.nativeSymbol) {
        throw new Error(t('err.assetNotSupported', { name: chain.name, asset }));
      }
      // 取当前网络环境下派生的 BTC 账户（主网 / 测试网私钥不同）
      const btc = getActiveBtcAccount();
      if (!btc) throw new Error(t('err.walletLocked'));
      txHash = await sendBtc(btc, to.trim(), String(amount).trim());
    } else if (chain.kind === 'solana') {
      if (asset !== chain.nativeSymbol) {
        throw new Error(t('err.assetNotSupported', { name: chain.name, asset }));
      }
      txHash = await sendSol(active.sol.secretKey, to.trim(), String(amount).trim());
    } else {
      txHash =
        asset === chain.nativeSymbol
          ? await sendNative(chainKey, active.wallet, to.trim(), String(amount).trim())
          : await sendChainToken(chainKey, active.wallet, asset, to.trim(), String(amount).trim());
    }

    // 交易提交后立即刷新一次余额
    void pollEthBalancesOnce();
    return txHash;
  });

  // IPC：手动锁定钱包（丢弃内存中的私钥，回到解锁界面）
  handle('wallet:lock', () => {
    return lockWallet('manual');
  });

  // 说明：不实现 Tray / 后台常驻。macOS 上不再依赖 `activate` 重建窗口，
  // 点击标题栏关闭按钮即销毁窗口并退出进程。
});

// 关闭最后一个窗口时直接退出进程（不再对 macOS 做「保留应用存活」的特例处理）
app.on('window-all-closed', () => {
  app.quit();
});

// 应用退出前可靠地关闭数据库，避免 LOCK 残留导致下次启动 "Database failed to open"
let isQuitting = false;
app.on('before-quit', (event) => {
  if (isQuitting) return;
  event.preventDefault();
  isQuitting = true;
  stopAutoLock();
  stopEthBalancePolling();
  clearActiveWallet();
  closeDatabase()
    .catch((err) => console.error('[main] 关闭数据库失败:', err))
    .finally(() => app.quit());
});


