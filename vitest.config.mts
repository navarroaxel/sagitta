import { defineConfig } from 'vitest/config';
import path from 'path';

const root = path.dirname(new URL(import.meta.url).pathname);
const alias = { '@': path.resolve(root, './src') };

export default defineConfig({
  resolve: { alias },
  test: {
    projects: [
      {
        // Pure logic/math — fast, no DOM.
        resolve: { alias },
        test: {
          name: 'lib',
          environment: 'node',
          include: ['**/lib/__tests__/**/*.test.ts'],
          globals: true,
        },
      },
      {
        // React component regression tests.
        resolve: { alias },
        test: {
          name: 'components',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: { url: 'http://localhost/' },
          },
          include: ['**/components/__tests__/**/*.test.tsx'],
          setupFiles: [path.resolve(root, './vitest.setup.ts')],
          globals: true,
        },
      },
    ],
  },
});
