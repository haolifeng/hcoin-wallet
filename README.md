# HCoinWallet

基于 **Electron + Vite + React + MobX** 的桌面钱包应用。

---

## 环境要求

| 依赖  | 版本         | 说明                                                         |
| ----- | ------------ | ------------------------------------------------------------ |
| Node  | 18 / 20 / 22 | **不要使用 Node 23+**（如 v26），会导致 Electron / electron-builder 兼容性问题和大量警告 |
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
| `npm run electron:build`  | 打包前端并生成可分发安装包（electron-builder）          |
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

本项目要求 Node `>=18 <23`。若使用 Node 23+，请通过 nvm 切换到 20。

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
├── electron/
│   ├── main.ts          # Electron 主进程入口
│   └── preload.ts       # 预加载脚本
├── scripts/
│   └── install-electron.js  # Electron 二进制稳定安装脚本
├── src/                 # React 渲染进程源码
├── .npmrc               # 镜像配置
├── vite.config.ts       # Vite + vite-plugin-electron 配置
└── package.json
```
