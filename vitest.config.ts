import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx', '**/*.api.test.ts', '**/*.ui.test.tsx'],
    
    // Set default environment to node for API tests
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // Environment-specific setup
    environmentOptions: {
      jsdom: {
        setupFiles: ['./src/__tests__/ui-setup.ts'],
      },
    },
    
    // Disable typecheck during tests
    typecheck: {
      enabled: false,
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});