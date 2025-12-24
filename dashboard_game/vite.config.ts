import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Включаем необходимые полифиллы для @ton/core
      include: ['buffer', 'process'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  server: {
    port: 5175,
    host: 'localhost',
    strictPort: false,
    proxy: {
      '/webhook': {
        target: 'https://n8n-p.blc.am',
        changeOrigin: true,
        secure: false,
      },
      '/webhook-test': {
        target: 'https://n8n-p.blc.am',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  base: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
