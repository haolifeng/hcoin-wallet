#!/usr/bin/env node
/**
 * 稳定安装 Electron 二进制的脚本。
 *
 * 作用：
 *  - 强制使用国内镜像（ELECTRON_MIRROR / electron_mirror），避免从 GitHub 下载卡住；
 *  - 校验 node_modules/electron 是否已完整安装（dist/electron.exe + path.txt）；
 *  - 若未安装或安装不完整，则调用 electron 自带的 install.js 重新下载解压；
 *  - 不完整时先清理残留的 dist 目录，避免半成品导致后续误判为“已安装”。
 *
 * 使用方式：
 *  - 通过 package.json 的 postinstall / electron:install 自动调用；
 *  - 也可手动执行： node scripts/install-electron.js
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

// 镜像地址可通过环境变量覆盖，默认走 npmmirror。
const ELECTRON_MIRROR =
  process.env.ELECTRON_MIRROR || 'https://npmmirror.com/mirrors/electron/';

const electronDir = path.join(__dirname, '..', 'node_modules', 'electron');
const installer = path.join(electronDir, 'install.js');
const distDir = path.join(electronDir, 'dist');
const pathTxt = path.join(electronDir, 'path.txt');

function getPlatformBinaryName() {
  switch (process.platform) {
    case 'win32':
      return 'electron.exe';
    case 'darwin':
      return path.join('Electron.app', 'Contents', 'MacOS', 'Electron');
    default:
      return 'electron';
  }
}

function isInstalled() {
  try {
    const binary = path.join(distDir, getPlatformBinaryName());
    return fs.existsSync(binary) && fs.existsSync(pathTxt);
  } catch {
    return false;
  }
}

function main() {
  if (!fs.existsSync(installer)) {
    console.warn(
      '[install-electron] 未找到 node_modules/electron，跳过。' +
        '请先运行 npm install 安装依赖。'
    );
    return; // 不阻断整体 npm install
  }

  if (isInstalled()) {
    console.log('[install-electron] Electron 二进制已就绪，跳过下载。');
    return;
  }

  console.log('[install-electron] Electron 二进制缺失或不完整，开始重新安装…');
  console.log(`[install-electron] 使用镜像: ${ELECTRON_MIRROR}`);

  // 清理残留的半成品 dist，避免解压冲突与误判。
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }
  if (fs.existsSync(pathTxt)) {
    fs.rmSync(pathTxt, { force: true });
  }

  const result = spawnSync(process.execPath, [installer], {
    stdio: 'inherit',
    env: {
      ...process.env,
      // 同时设置新/旧两套变量名，兼容不同版本的 @electron/get。
      ELECTRON_MIRROR,
      electron_mirror: ELECTRON_MIRROR,
    },
  });

  if (result.status !== 0 || !isInstalled()) {
    console.error(
      '\n[install-electron] Electron 二进制安装失败。\n' +
        '可尝试：\n' +
        '  1. 清理缓存后重试：\n' +
        `     Remove-Item -Recurse -Force "$env:LOCALAPPDATA\\electron\\Cache"\n` +
        '     npm run electron:install\n' +
        '  2. 检查网络/代理，或更换 ELECTRON_MIRROR 环境变量后重试。\n'
    );
    process.exit(1);
  }

  console.log('[install-electron] Electron 二进制安装完成 ✓');
}

main();
