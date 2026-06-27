import type { Config } from 'jest';

// Shared transform/resolver settings for both projects.
const common = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'commonjs' } }],
  } as Config['transform'],
};

const config: Config = {
  projects: [
    {
      // Pure logic/math — fast, no DOM.
      ...common,
      displayName: 'lib',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['**/lib/__tests__/**/*.test.ts'],
    },
    {
      // React component regression tests.
      ...common,
      displayName: 'components',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['**/components/__tests__/**/*.test.tsx'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    },
  ],
};

export default config;
