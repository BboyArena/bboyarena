import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const gameRoot = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const gameBase = process.env.PUBLIC_GAME_BASE?.trim() || '/';

export default defineConfig({
  root: gameRoot,
  base: gameBase,
  publicDir: `${gameRoot}/public`,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: `${repoRoot}/dist-game`,
    emptyOutDir: true
  },
  server: {
    host: '0.0.0.0',
    port: 4322
  },
  preview: {
    host: '0.0.0.0',
    port: 4323
  }
});
