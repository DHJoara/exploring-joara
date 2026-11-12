import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    alias: [
      {
        find: /^.*\/\.open-next\/worker\.js$/,
        replacement: fileURLToPath(
          new URL('./tests/fixtures/open-next-worker.ts', import.meta.url),
        ),
      },
    ],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
  },
})
