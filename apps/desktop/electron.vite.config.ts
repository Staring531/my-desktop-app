import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

const root = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { rollupOptions: { input: { index: resolve(root, 'src/main/index.ts') } } },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: { index: resolve(root, 'src/preload/index.ts') },
        output: { format: 'cjs', entryFileNames: 'index.js' },
      },
    },
  },
  renderer: {
    resolve: { alias: { '@renderer': resolve(root, 'src/renderer/src') } },
    plugins: [react()],
  },
});
