import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test file for all tests
config({ path: resolve(__dirname, '../../.env.test') });