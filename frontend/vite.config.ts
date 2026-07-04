/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..', // lee .env de la raiz del repo

  server: {
    port: 5173,
    proxy: {
      // netlify dev sirve functions en 8888
      '/.netlify/functions': 'http://localhost:8888',
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
