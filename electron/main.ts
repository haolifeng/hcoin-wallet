import { app, BrowserWindow, ipcMain } from 'electron';
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
  closeDatabase,
} from './db';
import { startEthBalancePolling, stopEthBalancePolling, pollEthBalancesOnce } from './balance-poller';
import { deriveWallet, getChain, sendNative, sendChainToken } from './chains';
import { deriveBtcAccount, sendBtc } from './bitcoin';
import { deriveSolAccount, sendSol } from './solana';
import { setActiveWallet, getActiveWallet, clearActiveWallet } from './session';

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
}

let mainWindow: BrowserWindow | null = null;

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
    },
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

// 应用启动时初始化数据库
app.whenReady().then(async () => {
  try {
  await initDatabase();
  } catch (err) {
    // 数据库初始化失败不应导致应用静默崩溃
    console.error('[main] 数据库初始化失败，应用将以只读/无数据方式继续运行:', err);
  }
  createWindow();

  // 后台轮询各测试网（Sepolia / Fuji）余额并写入数据库，供渲染进程查询
  startEthBalancePolling();

  // IPC：渲染进程请求余额
  ipcMain.handle('wallet:getBalance', (_event, address: string) => {
    return queryBalance(address);
  });

  // IPC：渲染进程轮询请求各链余额（链 key → { native, tokens }）
  ipcMain.handle('wallet:getChainBalances', (_event, address: string) => {
    return queryChainBalances(address);
  });

  // IPC：渲染进程请求左侧菜单对应分区的数据
  ipcMain.handle('wallet:getSectionData', (_event, section: string) => {
    return querySectionData(section);
  });

  // IPC：生成 12 个助记词（BIP39 英文词库，词库不进入渲染进程产物）
  ipcMain.handle('wallet:generateMnemonic', () => {
    return generateMnemonic();
  });

  // IPC：校验助记词是否合法（导入助记词时使用，词库只在主进程）
  ipcMain.handle('wallet:validateMnemonic', (_event, mnemonic: string) => {
    return isValidMnemonic(mnemonic);
  });

  // IPC：创建账户（助记词 + 密码 → 主进程加密后写入 LevelDB，仅回传地址）
  // 创建与导入共用：导入时传入的是用户已有的助记词，同样加密落盘并派生 ETH 账户
  ipcMain.handle('wallet:createAccount', async (_event, mnemonic: string, password: string) => {
    const result = await createAccount(mnemonic, password);
    // 建立签名会话（EVM + BTC + SOL 私钥仅存于主进程内存），随后立即触发一次余额轮询
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      deriveBtcAccount(mnemonic),
      deriveSolAccount(mnemonic),
    );
    void pollEthBalancesOnce();
    return result;
  });

  // IPC：账户列表（备份时选择要备份的账户）
  ipcMain.handle('wallet:listAccounts', () => {
    return listAccounts();
  });

  // IPC：备份助记词（用密码解密数据库中保存的密文，仅在用户输入正确密码后回传明文）
  ipcMain.handle('wallet:backupMnemonic', (_event, address: string, password: string) => {
    return decryptMnemonic(address, password);
  });

  // IPC：启动检测——数据库里是否已存在加密助记词
  ipcMain.handle('wallet:hasMnemonic', () => {
    return hasMnemonic();
  });

  // IPC：解锁钱包（密码 → 解密助记词 → 派生 ETH 账户；私钥仅存于主进程内存）
  ipcMain.handle('wallet:unlockWallet', async (_event, address: string, password: string) => {
    const { result, mnemonic } = await unlockAccountWithSigner(address, password);
    setActiveWallet(
      result.address,
      deriveWallet(mnemonic),
      deriveBtcAccount(mnemonic),
      deriveSolAccount(mnemonic),
    );
    return result;
  });

  // IPC：发送交易（原生代币 ETH / AVAX，或 ERC-20 USDT / USDC）。
  // 私钥只在主进程内用于签名，不落盘、不回传
  ipcMain.handle('wallet:send', async (_event, params: SendParams) => {
    const { address, chain: chainKey, asset, to, amount } = params ?? ({} as SendParams);
    const active = getActiveWallet();
    if (!active) throw new Error('钱包未解锁，无法发送');
    if (active.address !== address) throw new Error('当前解锁账户与发送账户不一致');
    if (!to?.trim()) throw new Error('请输入接收地址');

    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) throw new Error('请输入有效的发送数量');

    const chain = getChain(chainKey);
    let txHash: string;
    if (chain.kind === 'bitcoin') {
      if (asset !== chain.nativeSymbol) {
        throw new Error(`链 ${chain.name} 不支持资产：${asset}`);
      }
      txHash = await sendBtc(active.btc, to.trim(), String(amount).trim());
    } else if (chain.kind === 'solana') {
      if (asset !== chain.nativeSymbol) {
        throw new Error(`链 ${chain.name} 不支持资产：${asset}`);
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
  stopEthBalancePolling();
  clearActiveWallet();
  closeDatabase()
    .catch((err) => console.error('[main] 关闭数据库失败:', err))
    .finally(() => app.quit());
});


