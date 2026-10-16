import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

// 原生模块（含 .node 二进制）不能被打包进 bundle，
// 必须保持 external，由运行时从 node_modules 加载。
// ethers 体积大且为纯 CJS/ESM 双格式，同样 external 以免主进程打包过慢。
const nativeModules = ['classic-level', 'ethers'];

export default defineConfig({
  plugins: [
    react(),
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