# Text Editor Tabs

A modern text editor web application built with a monorepo architecture using pnpm workspaces. The project includes a React-based frontend editor, an Express API server, PostgreSQL database with Drizzle ORM, and OpenAPI-based type safety.

## Overview

This application provides a rich text editing experience with real-time collaboration capabilities (if implemented), document management, and a fully typed API layer. The stack emphasizes type safety, developer experience, and production readiness.

## Prerequisites

- **Node.js** v24 or higher
- **pnpm** v9+
- **PostgreSQL** database (local or cloud)
- (Optional) **Docker** for local database

## Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:luisrpavanello/Text-Editor-Tabs.git
cd Text-Editor-Tabs
pnpm install
```

## Environment Variables

Create a `.env` file in the root directory (or in each package if needed) with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Port for the frontend dev server | `5173` |
| `BASE_PATH` | Base path for the frontend (usually `/`) | `/` |
| `NODE_ENV` | Environment (development/production) | `development` |

For the API server, you may also need:

```env
PORT=5000
DATABASE_URL=postgresql://...
```

## Running the Project

### 1. Start the Database

Make sure PostgreSQL is running and the database is created. You can use the Drizzle migrations:

```bash
pnpm --filter @workspace/db run push
```

This pushes the schema to your database (development only).

### 2. Run the API Server

```bash
pnpm --filter @workspace/api-server run dev
```

The API server will start on port `5000` by default (configurable via `PORT` env).

### 3. Run the Frontend Editor

In a separate terminal:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/editor run dev
```

The editor will be available at `http://localhost:5173`.

> **Note**: Both `PORT` and `BASE_PATH` are required for the editor Vite configuration.

## Available Scripts

From the root directory, you can run:

| Command | Description |
|---------|-------------|
| `pnpm run typecheck` | Run TypeScript type checking across all packages |
| `pnpm run build` | Build all packages (runs typecheck first) |
| `pnpm run typecheck:libs` | Typecheck only shared libraries (`lib/*`) |

### Package-specific scripts

| Package | Command | Purpose |
|---------|---------|---------|
| `@workspace/editor` | `pnpm --filter @workspace/editor run dev` | Start frontend dev server |
| `@workspace/api-server` | `pnpm --filter @workspace/api-server run dev` | Start API server |
| `@workspace/db` | `pnpm --filter @workspace/db run push` | Push schema changes to DB |
| `@workspace/api-spec` | `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from OpenAPI spec |

## Project Structure

```
.
├── artifacts/               # Runnable applications
│   ├── api-server/          # Express backend (port 5000)
│   ├── editor/              # React frontend (main editor)
│   └── mockup-sandbox/      # Isolated component sandbox
├── lib/                     # Shared libraries
│   ├── api-client-react/    # React Query hooks generated from OpenAPI
│   ├── api-spec/            # OpenAPI specification and Orval config
│   ├── api-zod/             # Zod schemas derived from OpenAPI
│   └── db/                  # Database schema + Drizzle ORM
├── scripts/                 # Utility scripts (post-merge hooks, etc.)
├── package.json             # Root workspace configuration
├── pnpm-workspace.yaml      # Workspace & catalog definitions
├── tsconfig.base.json       # Shared TypeScript settings
└── tsconfig.json            # Root references to libraries
```

## Technology Stack

| Area | Technologies |
|------|--------------|
| **Monorepo** | pnpm workspaces with catalog dependencies |
| **Frontend** | React 19, Vite 7, Tailwind CSS 4, shadcn/ui |
| **Backend** | Express 5, Drizzle ORM, PostgreSQL |
| **Type Safety** | TypeScript 5.9, Zod 4 (via catalog), drizzle-zod |
| **API Generation** | OpenAPI 3, Orval (React Query hooks & Zod schemas) |
| **Build Tool** | esbuild (CJS bundles for API server) |
| **Logging** | Pino + pino-http |

## Development Workflow

### Type Checking

Always run type checking before committing:

```bash
pnpm run typecheck
```

### Building for Production

```bash
pnpm run build
```

This will typecheck and build all packages.

### Adding a New API Endpoint

1. Edit `lib/api-spec/openapi.yaml` with your new endpoint.
2. Run code generation:
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```
3. This will regenerate:
   - Zod schemas in `lib/api-zod/src/generated/`
   - React Query hooks in `lib/api-client-react/src/generated/`
4. Implement the endpoint in `artifacts/api-server/src/routes/`.

### Database Schema Changes

1. Edit `lib/db/src/schema/index.ts`.
2. Push changes to the database (development only):
   ```bash
   pnpm --filter @workspace/db run push
   ```
3. Regenerate Zod schemas for the database types (if needed):
   ```bash
   pnpm --filter @workspace/db run generate
   ```

## Troubleshooting

### "Use pnpm instead" error

The root `package.json` forces pnpm. Ensure you are using pnpm and not npm or yarn.

### Missing `PORT` or `BASE_PATH` for editor

The editor's Vite config requires both environment variables. Set them before running:

```bash
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/editor run dev
```

### Database connection issues

Verify your `DATABASE_URL` is correct and the database server is reachable. For local development, you can use:

```bash
# Start a local PostgreSQL container (example)
docker run --name postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

### TypeScript errors after code generation

If you regenerate the API client, make sure to restart your TypeScript server or IDE.

## License

MIT
