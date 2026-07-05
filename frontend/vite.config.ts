import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  envDir: '..', // lee .env de la raiz del repo

  server: {
    port: 5173,
  },
});
