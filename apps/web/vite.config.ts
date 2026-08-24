import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@sokoza/types': path.resolve(__dirname, '../../packages/types/src'),
      '@sokoza/config': path.resolve(__dirname, '../../packages/config/src'),
      '@sokoza/validation': path.resolve(__dirname, '../../packages/validation/src'),
    },
  },
});
