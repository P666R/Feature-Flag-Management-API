import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // * Root test folder
    dir: 'tests',
    // * Match test files
    include: ['**/*.test.js'],
    coverage: {
      provider: 'v8',
      // * Console and HTML reports
      reporter: ['text', 'lcov'],
      // * Skip entry points
      exclude: ['src/server.js', 'src/app.js'],
    },
    // * Global setup
    setupFiles: ['tests/setup/testEnv.js'],
  },
});
