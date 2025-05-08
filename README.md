# Solace Advocates Portal

A Next.js application for finding and filtering advocate professionals with various specialties. The application features a searchable and filterable list of advocates with pagination support.

## Features

- Database-driven advocate listings
- Search functionality across multiple fields
- Filtering by city and specialty
- Pagination
- Responsive Material UI interface

## Technologies

- [Next.js](https://nextjs.org/) 14 with App Router
- [React](https://reactjs.org/) 18
- [Material UI](https://mui.com/) for UI components
- [PostgreSQL](https://www.postgresql.org/) for data storage
- [Drizzle ORM](https://orm.drizzle.team/) for database interactions
- [Vitest](https://vitest.dev/) for testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Docker (for running PostgreSQL) or a PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Ensure your `.env` file contains the database connection string:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost/solaceassignment
   ```

### Database Setup

The application requires a PostgreSQL database. You can run it using Docker:

1. Start the PostgreSQL container:

```bash
docker compose up -d
```

2. Push the database schema:

```bash
npx drizzle-kit push
```

3. Seed the database with sample data:

```bash
# Ensure the application is running first
npm run dev

# In a separate terminal, seed the database
curl -X POST http://localhost:3000/api/seed
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development

### Code Quality

Ensure code quality by running TypeScript checks and linting:

```bash
# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Building for Production

```bash
npm run build
npm start
```

## Testing

This project uses Vitest for testing. The tests focus on the API functionality, including filtering, search, and pagination.

### Prerequisites for Testing

1. Setup and seed the database as described above
2. Ensure your `.env.test` file contains the database connection string:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost/solaceassignment
   ```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage
```

### Test Structure

- `src/__tests__/api/advocates.test.ts`: Tests for the Advocates API endpoints
  - Basic functionality tests
  - Search functionality tests
  - City and specialty filtering tests
  - Pagination tests

## API Documentation

### Advocates API

**Endpoint:** `/api/advocates`

**Method:** GET

**Query Parameters:**
- `page` (number): Page number, starting from 0 (default: 0)
- `pageSize` (number): Number of items per page (default: 5)
- `city` (string): Filter by city name
- `specialty` (string): Filter by specialty name
- `search` (string): Search across all fields

**Example Response:**
```json
{
  "data": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "city": "New York",
      "degree": "MD",
      "specialties": ["Trauma & PTSD", "Personal growth"],
      "yearsOfExperience": 10,
      "phoneNumber": 5551234567,
      "createdAt": "2025-05-07T22:48:50.121Z"
    }
  ],
  "pagination": {
    "total": 30,
    "page": 0,
    "pageSize": 5,
    "pageCount": 6
  }
}
```

## License

This project is licensed under the MIT License.