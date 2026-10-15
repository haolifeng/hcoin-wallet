import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import {
  initDatabase,
  queryBalance,
  querySectionData,
  generateMnemonic,
  createAccount,
  listAccounts,
  decryptMnemonic,
  closeDatabase,
} from './db';

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

  // IPC：渲染进程请求余额
  ipcMain.handle('wallet:getBalance', (_event, address: string) => {
    return queryBalance(address);
  });

  // IPC：渲染进程请求左侧菜单对应分区的数据
  ipcMain.handle('wallet:getSectionData', (_event, section: string) => {
    return querySectionData(section);
  });

  // IPC：生成 12 个助记词（BIP39 英文词库，词库不进入渲染进程产物）
  ipcMain.handle('wallet:generateMnemonic', () => {
    return generateMnemonic();
  });

  // IPC：创建账户（助记词 + 密码 → 主进程加密后写入 LevelDB，仅回传地址）
  ipcMain.handle('wallet:createAccount', (_event, mnemonic: string, password: string) => {
    return createAccount(mnemonic, password);
  });

  // IPC：账户列表（备份时选择要备份的账户）
  ipcMain.handle('wallet:listAccounts', () => {
    return listAccounts();
  });

  // IPC：备份助记词（用密码解密数据库中保存的密文，仅在用户输入正确密码后回传明文）
  ipcMain.handle('wallet:backupMnemonic', (_event, address: string, password: string) => {
    return decryptMnemonic(address, password);
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
  closeDatabase()
    .catch((err) => console.error('[main] 关闭数据库失败:', err))
    .finally(() => app.quit());
});


