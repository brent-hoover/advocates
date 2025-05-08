# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js project for a Solace Advocate listing application that displays a list of advocates with their information, including search, filtering, and pagination capabilities.

## Important Guidelines

1. Always fix TypeScript errors automatically when modifying code
2. Maintain the existing architectural patterns when implementing new features
3. Ensure API endpoints maintain consistent response formats

## Commands

### Development

```bash
# Install dependencies
npm i

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint the code
npm run lint

# Type check
npx tsc --noEmit
```

### Database Setup

```bash
# Start PostgreSQL database with Docker
docker compose up -d

# Push schema to database
npx drizzle-kit push

# Seed the database with sample data
curl -X POST http://localhost:3000/api/seed
```

## Architecture

### Frontend

- Next.js application with React 18 and TypeScript
- Material UI for component styling
- Client sends search, filter, and pagination parameters to the API
- Displays advocate data returned from the API

### Backend

- Next.js API Routes for data handling (/api/advocates/route.ts)
- Server-side implementation of filtering, search, and pagination
- API currently uses static data imported from src/db/seed/advocates.ts
- Database infrastructure is set up but not actively used in the main data flow

### Data Flow

1. Frontend requests data from /api/advocates with query parameters (page, pageSize, city, specialty, search)
2. Backend applies filters to the static data from advocates.ts
3. Filtered and paginated results are returned to the frontend
4. Frontend renders the data with pagination controls

### Data Model

The main data entity is an `Advocate` with these fields:
- id: number
- firstName: string
- lastName: string
- city: string
- degree: string
- specialties: string[]
- yearsOfExperience: number
- phoneNumber: number

### Current Branch: fix/search-and-list

Recent work on this branch includes:
- Implementation of server-side filtering and search
- Backend pagination
- TypeScript error fixes