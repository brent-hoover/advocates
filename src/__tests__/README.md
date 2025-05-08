# Test Documentation

## Overview

This directory contains automated tests for the Solace Advocates application. The tests are written using Vitest and focus on verifying the API functionality.

## Test Structure

```
src/__tests__/
├── api/
│   └── advocates.test.ts    # Tests for the Advocates API
├── setup.ts                 # Test setup file that loads environment variables
└── README.md                # This file
```

## Environment Setup

The tests require a configured `.env.test` file in the project root. This file should contain:

```
DATABASE_URL=postgresql://postgres:password@localhost/solaceassignment
```

Make sure your database is running and seeded before running the tests. The test setup file (`setup.ts`) will load these environment variables for the tests.

## Testing Approach

The API tests use direct function calls to the Next.js Route Handlers rather than making actual HTTP requests. This approach makes the tests faster and more reliable.

### The Advocates API Tests

The `advocates.test.ts` file includes tests for:

1. **Basic functionality**
   - Verifying that the API returns a list of advocates
   - Validating the structure of the advocate objects

2. **Search functionality**
   - Testing text search across multiple fields
   - Confirming that searches work for first and last names
   - Handling non-existent search terms

3. **Filtering functionality**
   - Testing filtering by city (exact and partial matches)
   - Testing filtering by specialty (exact and partial matches)
   - Handling non-existent filter values

4. **Pagination functionality**
   - Verifying that page parameters are respected
   - Testing different page sizes
   - Checking that page count calculations are correct
   - Testing edge cases like requesting the last page or beyond available data

## Running Tests

From the project root directory:

```bash
# Run all tests
npm test

# Run tests in watch mode (great for development)
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

## Adding New Tests

When adding new tests:

1. Follow the existing patterns for creating test requests and handlers
2. Group related tests using the `describe` function
3. Add proper error handling and skip logic for tests that depend on data
4. Update this documentation if you add new test files or categories

## Debugging Tests

If tests are failing, check:

1. Database connection and seeded data
2. Environment variables in `.env.test`
3. Changes to the API implementation that may affect test expectations