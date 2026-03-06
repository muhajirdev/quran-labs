import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';
import path from 'node:path';

export default defineWorkersConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' },
        // DO SQLite WAL mode (.sqlite-shm/.sqlite-wal) is incompatible with
        // vitest-pool-workers' per-test storage isolation. Disable it and rely
        // on unique graph IDs in each test for isolation instead.
        isolatedStorage: false,
      },
    },
  },
});
