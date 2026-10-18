# HCoinWallet

基于 **Electron + Vite + React + MobX** 的桌面钱包应用。

[简体中文](./README.md) | [English](./README_EN.md)

---

## 环境要求

| 依赖  | 版本         | 说明                                                         |
| ----- | ------------ | ------------------------------------------------------------ |
| Node  | 20 / 22 | **打包请使用 Node 22**（electron-builder 26 的部分依赖要求 ≥22.12）；**不要使用 Node 23+**（如 v26），会导致 Electron / electron-builder 兼容性问题和大量警告 |
| npm   | >= 9         | —                                                            |
| 操作系统 | Windows / macOS / Linux | —                                        |

> 使用 nvm 切换版本：
>
> ```powershell
> nvm install 20
> nvm use 20
> ```

---

## 快速开始

```powershell
# 1. 安装依赖（会自动安装 Electron 二进制）
npm install

# 2. 启动开发环境（Vite + 自动拉起 Electron 窗口）
npm run electron:dev
```

`electron:dev` 实际执行 `vite`，由 `vite-plugin-electron` 自动编译主进程 / 预加载脚本并启动 Electron。

---

## 常用脚本

| 命令                      | 作用                                                     |
| ------------------------- | -------------------------------------------------------- |
| `npm run dev`             | 仅启动 Vite 前端开发服务器（不启动 Electron）           |
| `npm run electron:dev`    | 启动 Vite 并自动拉起 Electron（开发用）                 |
| `npm run build`           | TypeScript 编译 + Vite 打包前端产物到 `dist/`           |
| `npm run icons`           | 生成 `build/` 下的应用图标（ico / icns / png）          |
| `npm run dist`            | 打包当前系统的安装包（= `electron:build`）              |
| `npm run dist:win`        | 打包 Windows 安装包（NSIS + 便携版）                    |
| `npm run dist:mac`        | 打包 macOS 安装包（dmg + zip，arm64 / x64）             |
| `npm run dist:linux`      | 打包 Linux 安装包（AppImage + deb + tar.gz）            |
| `npm run dist:all`        | 一次生成三平台安装包                                    |
| `npm run dist:dir`        | 只生成未压缩目录，用于快速验证打包配置（不产出安装包）  |
| `npm run electron:install`| 手动补装 / 修复 Electron 二进制                          |

---

## 镜像与网络

项目根目录的 `.npmrc` 已配置国内镜像，加速依赖与二进制下载：

```ini
registry=https://registry.npmmirror.com
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
ignore-scripts=false
```

- `electron_mirror`：Electron 二进制（约 100MB）下载地址。
- `electron_builder_binaries_mirror`：electron-builder 打包所需工具下载地址。
- `ignore-scripts=false`：**必须**，否则依赖的 `postinstall`（Electron 二进制下载）不会执行。

> 如需临时改用其它镜像，可设置环境变量（优先级高于 `.npmrc`）：
>
> ```powershell
> $env:ELECTRON_MIRROR = "https://your-mirror.example.com/electron/"
> npm run electron:install
> ```

---

## 安全设计

钱包类应用的核心假设是：**渲染进程不可信**。私钥与签名能力只存在于主进程，任何转账都必须重新验证密码。

| 机制 | 实现位置 | 说明 |
| ---- | -------- | ---- |
| 私钥只在主进程 | `electron/session.ts` | 助记词解密、密钥派生、签名全部在主进程完成，只向界面回传地址 |
| 签名前二次认证 | `electron/main.ts`（`wallet:send`） | 每笔交易都要传支付密码，主进程用 AES-GCM 认证校验，失败计入限速 |
| 自动锁定 | `electron/main.ts` | 5 分钟系统级空闲、系统锁屏、休眠时丢弃内存中的私钥；界面退回解锁页 |
| 手动锁定 | Header「锁定」按钮 | 立即销毁会话，之后的发送请求返回「钱包未解锁」 |
| IPC 来源校验 | `electron/security.ts` | 每个 IPC 通道校验 `senderFrame.url` 必须是应用自身页面 |
| 密码策略（主进程强制） | `electron/security.ts` | ≥8 位且含大小写字母、数字、特殊字符；绕过界面直接调 IPC 也会被拒 |
| 认证限速 | `electron/security.ts` | 失败 5 次后锁定，15s 起指数退避，最长 5 分钟 |
| 助记词加密 | `electron/db/index.ts` | AES-256-GCM + scrypt(N=131072, r=8, p=1, 128MB)，异步派生不阻塞主进程 |
| 渲染进程加固 | `electron/main.ts` | `contextIsolation` + `sandbox` + 禁用 Node、生产禁用 DevTools、拦截导航与新窗口 |
| CSP | `vite.config.ts`（仅生产） | 禁止远程脚本、内联脚本与任意域名外联，`connect-src` 仅放行行情接口 |
| 金额与费率防护 | `electron/bitcoin.ts`、`electron/solana.ts` | 超出精度直接报错（不静默截断）；BTC 费率限制在 1–1000 sat/vB；外部请求 15s 超时 |

> 兼容性：scrypt 参数提升后，旧数据库中的账户仍可解锁（解密时使用密文里记录的参数）。

**尚未覆盖、建议后续补上**：安装包代码签名 / 公证、自动更新、RPC 与区块浏览器 API 的多源交叉校验、硬件钱包支持。

---

## 打包与分发

打包使用 electron-builder，配置在 `package.json` 的 `build` 字段，图标资源在 `build/`。

### 一次生成三平台安装包

```bash
npm run dist:all
```

也可以只打某一个平台：

```bash
npm run dist:win     # Windows
npm run dist:mac     # macOS
npm run dist:linux   # Linux
npm run dist         # 仅当前系统
```

产物统一输出到 `release/<version>/`：

| 平台    | 产物                                         | 说明                          |
| ------- | -------------------------------------------- | ----------------------------- |
| Windows | `HCoinWallet-1.0.0-x64-setup.exe`            | NSIS 安装包，可自选安装目录   |
| Windows | `HCoinWallet-1.0.0-x64-portable.exe`         | 免安装便携版                  |
| macOS   | `HCoinWallet-1.0.0-arm64.dmg` / `-x64.dmg`   | Apple 芯片 / Intel 安装镜像   |
| macOS   | `HCoinWallet-1.0.0-<arch>.zip`               | 压缩包（便于分发 / 自动更新） |
| Linux   | `HCoinWallet-1.0.0-x86_64.AppImage`          | 免安装可执行文件              |
| Linux   | `HCoinWallet-1.0.0-amd64.deb`                | Debian / Ubuntu 安装包        |
| Linux   | `HCoinWallet-1.0.0-x64.tar.gz`               | 压缩包                        |

> 只想快速验证打包配置（不产出安装包，速度快）：`npm run dist:dir`。

### 构建机要求

| 目标平台 | 可用的构建机              | 备注                                                      |
| -------- | ------------------------- | --------------------------------------------------------- |
| Windows  | Windows / macOS / Linux   | electron-builder 会自动下载 NSIS 与 wine，无需本机装交叉工具链 |
| Linux    | Linux / macOS             | —                                                          |
| macOS    | **仅 macOS**              | dmg 依赖 `hdiutil`，且签名 / 公证只能在 macOS 完成         |

因此，**三平台全量打包请在 macOS 上执行 `npm run dist:all`**；若要完全自动化，推荐用三台（或三个容器）的 CI 分别构建。

### 图标

`build/` 下的图标由脚本零依赖生成（不依赖 sharp / ImageMagick / iconutil，Windows / Linux 上同样可用）：

```bash
npm run icons                        # 已存在则跳过
node scripts/gen-icons.js --force    # 修改设计后强制重建
```

- `build/icon.ico`：Windows
- `build/icon.icns`：macOS
- `build/icon.png` + `build/icons/*.png`：Linux
- `build/icon.svg`：矢量源文件（仅供查看，不参与打包）

修改 `scripts/gen-icons.js` 顶部的 `DESIGN` 即可调整配色与字形。

### 代码签名

默认配置为**不签名**（`build.mac.identity: null`），便于本地出包：

- macOS 首次打开会提示「无法验证开发者」，可右键 → 打开，或执行
  `xattr -dr com.apple.quarantine /Applications/HCoinWallet.app`。
- Windows 未签名时 SmartScreen 会提示，需要用户点击「仍要运行」。

正式分发时：

```bash
# macOS：去掉 build.mac.identity 的 null，并提供证书
export CSC_LINK=/path/to/cert.p12
export CSC_KEY_PASSWORD=******
# 公证（可选，需 Apple 开发者账号）
export APPLE_ID=you@example.com
export APPLE_APP_SPECIFIC_PASSWORD=****
export APPLE_TEAM_ID=XXXXXXXXXX
npm run dist:mac

# Windows：同样通过 CSC_LINK / CSC_KEY_PASSWORD 提供 pfx 证书
npm run dist:win
```

### 打包相关的实现细节

- `build.files` 只包含 `dist/`、`dist-electron/` 与 `package.json`，生产依赖由 electron-builder 自动收集，开发依赖不会进入安装包。
- `classic-level` 等原生模块（`.node`）通过 `asarUnpack` 解包到 `app.asar.unpacked/`，避免 asar 内无法 `dlopen`。
- `npmRebuild: false`：原生模块使用官方预编译二进制（`classic-level` 的 `prebuilds/` 已覆盖 `win32-x64`、`linux-x64`、`darwin-x64+arm64`），无需本机编译工具链。
- `electronDownload.mirror` 指向 npmmirror，避免打包时从 GitHub 拉取 Electron 卡住。

---

## 常见问题（FAQ）

### 1. `Electron failed to install correctly, please delete node_modules/electron and try installing again`

**原因**：Electron 的二进制没下载完整，`node_modules/electron/dist/` 里缺少 `electron.exe`（或对应平台的可执行文件），并且没有生成 `path.txt`。通常是安装过程中网络中断导致。

**解决**：

```powershell
# 清理 @electron/get 缓存
Remove-Item -Recurse -Force "$env:LOCALAPPDATA\electron\Cache" -ErrorAction SilentlyContinue

# 删除不完整的 electron
Remove-Item -Recurse -Force node_modules\electron

# 重新安装（走镜像）
npm install

# 若仍失败，单独补装（脚本会自动清理残留并重跑官方安装脚本）
npm run electron:install
```

**验证是否成功**（两个都应输出 `True`）：

```powershell
Test-Path node_modules\electron\path.txt
Test-Path node_modules\electron\dist\electron.exe   # macOS/Linux 换成对应文件名
```

成功后即可重新运行 `npm run electron:dev`。

### 2. npm 提示 `Unknown project config "electron_mirror"`

这只是 npm 对未知配置项的**警告**，不影响 Electron 安装脚本读取该配置，可忽略。

### 3. Node 版本过新导致启动/打包报错

本项目要求 Node `>=20 <23`；打包请使用 Node 22（electron-builder 26 的部分依赖要求 ≥22.12）。若使用 Node 23+，请通过 nvm 切换到 22。

### 4. 内网 / 代理环境下载失败

```powershell
$env:HTTPS_PROXY = "http://your-proxy:port"
$env:HTTP_PROXY  = "http://your-proxy:port"
npm run electron:install
```

---

## 目录结构（部分）

```
.
├── build/                   # 打包资源（图标，由 scripts/gen-icons.js 生成）
│   ├── icon.ico             # Windows 图标
│   ├── icon.icns            # macOS 图标
│   ├── icon.png             # Linux 图标（512×512）
│   └── icons/               # Linux 各尺寸图标
├── electron/
│   ├── main.ts              # Electron 主进程入口（IPC、窗口加固、自动锁定）
│   ├── preload.ts           # 预加载脚本（白名单 API）
│   ├── security.ts          # IPC 来源校验、密码策略、认证限速
│   ├── session.ts           # 内存中的解锁会话（私钥只在这里）
│   └── db/                  # LevelDB + 助记词加密存储
├── scripts/
│   ├── gen-icons.js         # 应用图标生成（零依赖）
│   └── install-electron.js  # Electron 二进制稳定安装脚本
├── src/                     # React 渲染进程源码
├── release/                 # 打包产物输出目录（git 忽略）
├── .npmrc                   # 镜像配置
├── vite.config.ts           # Vite + vite-plugin-electron 配置
└── package.json             # 依赖、脚本与 electron-builder 配置
```
