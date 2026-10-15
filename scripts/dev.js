#!/usr/bin/env node
/**
 * 开发环境启动器。
 *
 * 背景：
 *  某些 IDE / 终端会全局注入 `ELECTRON_RUN_AS_NODE=1`。
 *  该变量会让 Electron 以「纯 Node 模式」运行，导致主进程里
 *  `require('electron').app` 为 undefined，报错：
 *      TypeError: Cannot read properties of undefined (reading 'whenReady')
 *  进而 Electron 窗口无法打开，页面看起来「没有任何变化」。
 *
 * 本脚本在启动 Vite（含 vite-plugin-electron）前显式删除该变量，
 * 保证 Electron 以正常 GUI 模式启动。跨平台，无需 shell 的 unset/export。
 *
 * 使用：npm run dev  /  npm run electron:dev
 */

'use strict';

const path = require('path');
const { spawn } = require('child_process');

// 关键：清除会把 Electron 拉入纯 Node 模式的变量。兼容大小写两种写法。
delete process.env.ELECTRON_RUN_AS_NODE;
delete process.env.electron_run_as_node;

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;
delete env.electron_run_as_node;

// 额外允许透传参数，如 `npm run dev -- --port 5200`
const extraArgs = process.argv.slice(2);

const viteBin = path.join(__dirname, '..', 'node_modules', 'vite', 'bin', 'vite.js');

const child = spawn(process.execPath, [viteBin, ...extraArgs], {
  stdio: 'inherit',
  env,
});

child.on('exit', (code) => process.exit(code ?? 0));
