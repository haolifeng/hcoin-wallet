import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

// 原生模块（含 .node 二进制）不能被打包进 bundle，
// 必须保持 external，由运行时从 node_modules 加载。
// ethers 体积大且为纯 CJS/ESM 双格式；@solana/web3.js 依赖较多且体积大，
// 同样 external，避免主进程打包过慢或出现 Node 内建模块解析问题。
const nativeModules = ['classic-level', 'ethers', '@solana/web3.js'];

/**
 * 生产构建时向 index.html 注入 CSP，限制脚本/资源/网络请求的来源。
 * 作用：即使渲染进程出现 XSS，也无法加载远程脚本或把数据外传到任意域名。
 * 开发环境不注入（Vite HMR 需要 ws 连接与内联脚本）。
 */
function cspPlugin(): Plugin {
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    // antd 使用 CSS-in-JS 注入 <style>，需要放行内联样式
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self' data:",
    // 仅允许访问行情接口；链上 RPC 全部在主进程发起，不受此限制
    "connect-src 'self' https://api.coingecko.com",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    // 注意：frame-ancestors 只能在响应头中生效，放在 <meta> 会被忽略
  ].join('; ');

  return {
    name: 'hcoin-inject-csp',
    apply: 'build',
    transformIndexHtml() {
      // injectTo: 'head-prepend' 保证 CSP 位于所有脚本/样式之前，
      // 否则它只约束其后出现的资源，起不到防护作用
      return [
        {
          tag: 'meta',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: csp,
          },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    cspPlugin(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', ...nativeModules],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart({ reload }) {
          reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', ...nativeModules],
            },
          },
        },
      },
    ]),
  ],
});
