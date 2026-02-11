import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    exclude: [
      'tests/e2e/**',
      'tests/python/**'
    ],
    coverage: {
      provider: 'istanbul'
    }
  },
  resolve: {
    alias: {
      '$lib': path.resolve(__dirname, 'src/lib')
    }
  }
});
