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

Keep local and production configuration separate. Do not change source code when switching between your Mac and the online deployment.

### Local development

Create a local `.env` file in the repository root. This file is ignored by git and should contain only your local values:

```env
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/tabpad
API_PORT=5001
EDITOR_PORT=5173
MOCKUP_PORT=5174
BASE_PATH=/
```

Notes:

- `DATABASE_URL` must point to your local or development database.
- `API_PORT` is used by the Express API during local development.
- `EDITOR_PORT` is used by the main Vite editor during local development.
- `MOCKUP_PORT` is used by the mockup sandbox during local development.
- The API still supports `PORT`, but for local development prefer `API_PORT` so it does not conflict with frontend tooling.

### Production

In production, configure environment variables in the hosting provider dashboard. The server should receive:

```env
NODE_ENV=production
PORT=<port provided by the host>
DATABASE_URL=<production database URL>
BASE_PATH=/
```

Do not commit production secrets to `.env`, README, or source files.

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

The API server loads the root `.env` automatically and starts on `API_PORT`. If neither `PORT` nor `API_PORT` is set locally, it falls back to `5001`.

### 3. Run the Frontend Editor

In a separate terminal:

```bash
pnpm --filter @workspace/editor run dev
```

The editor will be available at `http://localhost:5173`.

If you set a different `EDITOR_PORT` in `.env`, open that port instead.

### 4. Run the Mockup Sandbox

In another terminal, if needed:

```bash
pnpm --filter @workspace/mockup-sandbox run dev
```

The sandbox uses `MOCKUP_PORT` from `.env` or falls back to `5174`.

## Available Scripts

From the root directory, you can run:

| Command                   | Description                                      |
| ------------------------- | ------------------------------------------------ |
| `pnpm run typecheck`      | Run TypeScript type checking across all packages |
| `pnpm run build`          | Build all packages (runs typecheck first)        |
| `pnpm run typecheck:libs` | Typecheck only shared libraries (`lib/*`)        |

### Package-specific scripts

| Package                     | Command                                           | Purpose                                                |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------ |
| `@workspace/editor`         | `pnpm --filter @workspace/editor run dev`         | Start frontend dev server                              |
| `@workspace/api-server`     | `pnpm --filter @workspace/api-server run dev`     | Start API server                                       |
| `@workspace/mockup-sandbox` | `pnpm --filter @workspace/mockup-sandbox run dev` | Start mockup sandbox                                   |
| `@workspace/db`             | `pnpm --filter @workspace/db run push`            | Push schema changes to DB                              |
| `@workspace/api-spec`       | `pnpm --filter @workspace/api-spec run codegen`   | Regenerate API hooks and Zod schemas from OpenAPI spec |

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

| Area               | Technologies                                       |
| ------------------ | -------------------------------------------------- |
| **Monorepo**       | pnpm workspaces with catalog dependencies          |
| **Frontend**       | React 19, Vite 7, Tailwind CSS 4, shadcn/ui        |
| **Backend**        | Express 5, Drizzle ORM, PostgreSQL                 |
| **Type Safety**    | TypeScript 5.9, Zod 4 (via catalog), drizzle-zod   |
| **API Generation** | OpenAPI 3, Orval (React Query hooks & Zod schemas) |
| **Build Tool**     | esbuild (CJS bundles for API server)               |
| **Logging**        | Pino + pino-http                                   |

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

For deployment, let the hosting provider set `NODE_ENV=production`, `PORT`, and `DATABASE_URL`. Local-only variables such as `API_PORT`, `EDITOR_PORT`, and `MOCKUP_PORT` are not required in production.

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

### Missing `PORT` on the API server

Production requires `PORT` because most hosts inject the port at runtime. Local development can use `API_PORT` or the default `5001`.

If you see this in production:

```text
PORT environment variable is required in production but was not provided.
```

Set `PORT` in your hosting provider settings.

### Local `.env` is not being used

The API server script loads the root `.env` automatically. Frontend packages use local defaults and can be overridden with `EDITOR_PORT`, `MOCKUP_PORT`, and `BASE_PATH`.

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
