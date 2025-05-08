import { beforeAll, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { config } from 'dotenv';
import { resolve } from 'path';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Load .env.test file for all tests
config({ path: resolve(__dirname, '../../.env.test') });

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});