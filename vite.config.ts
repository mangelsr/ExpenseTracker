/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/utils/**/*.ts', 'src/components/**/*.{ts,tsx}'],
      exclude: [
        'src/utils/**/*.test.ts',
        'src/components/**/*.test.{ts,tsx}',
        'src/utils/database/connection.ts',
        'src/utils/database/transactions.ts',
        'src/utils/database/budgets.ts',
        'src/utils/database/categoryRules.ts',
        'src/utils/database/applianceLogs.ts',
        'src/utils/database.ts'
      ],
    },
  },
})
