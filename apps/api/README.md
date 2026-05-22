# API Structure

This folder contains the backend API built with NestJS, Prisma, and PostgreSQL.
The structure is intentionally simple so the team can grow the project feature by feature without locking into a heavy architecture too early.

## Goals of this structure

- Keep bootstrap and infrastructure code separate from business features.
- Group code by feature so the project stays readable as it grows.
- Keep database ownership inside the backend only.
- Leave room to add more modules later without a big refactor.

## Current structure

```text
apps/api/
  docs/
    requirement-v2-notes.md
  prisma/
    migrations/
    schema.prisma
    seed.ts
  src/
    config/
    modules/
      auth/
      health/
      users/
    shared/
      database/
    app.module.ts
    main.ts
    swagger.ts
  .env.example
  eslint.config.mjs
  nest-cli.json
  package.json
  tsconfig.json
  tsconfig.build.json
```

## Folder guide

### `docs/`

Short internal notes for the backend team.

Use this for:

- requirement alignment notes
- architecture decisions
- implementation order for new modules
- known business ambiguities that should be resolved before coding

Do not use this folder for source code.

### `prisma/`

This is the database layer entrypoint for the backend.

It should contain:

- `schema.prisma`
- generated migration folders
- seed scripts

It should not contain:

- Nest controllers
- business services
- request DTOs

Reason:

- the backend owns the database schema
- migrations stay close to the schema
- FE does not need direct database access

### `src/`

This is the real application source.
Anything that runs as part of the API should live here.

### `src/main.ts`

Nest bootstrap file.

It should do only application startup work, for example:

- create the Nest app
- register CORS
- set global prefix
- enable API versioning
- register global validation
- setup Swagger
- start listening on the configured port

Do not put business logic here.

### `src/app.module.ts`

Root Nest module.

It wires the application together by importing:

- config
- shared infrastructure modules
- feature modules

Think of this as the assembly point for the app.

### `src/swagger.ts`

Swagger setup is separated so `main.ts` stays small.

This file should contain:

- OpenAPI document metadata
- Swagger UI setup
- future auth documentation setup

### `src/config/`

Central place for application configuration and environment validation.

Current files:

- `app.config.ts`
- `auth.config.ts`
- `database.config.ts`
- `env.validation.ts`

This folder should contain:

- env parsing and mapping
- config for app, auth, database, redis, mail, storage
- validation for required environment variables

This folder should not contain:

- database queries
- HTTP controllers
- feature-specific business logic

Reason:

- env usage stays consistent
- config errors fail fast on startup
- the rest of the code does not read `process.env` everywhere

### `src/shared/`

Shared technical building blocks used by multiple modules.

Current shared area:

- `shared/database`

Future shared items can include:

- guards used by many modules
- interceptors
- filters
- decorators
- reusable helpers with real cross-module value

Do not move feature-specific business logic here just because it feels reusable.
If something only belongs to one feature, keep it inside that feature module.

### `src/shared/database/`

Database integration for Nest.

Current files:

- `database.module.ts`
- `prisma.service.ts`

Purpose:

- expose one shared `PrismaService`
- avoid creating `new PrismaClient()` in many places
- give other modules a clean dependency to inject

### `src/modules/`

Feature modules live here.

This is the main organizational layer of the backend.
NestJS is modular, which means each feature gets its own small container for controllers, services, DTOs, and guards when needed.

Why this layer exists:

- the codebase is grouped by feature, not by file type only
- each domain gets a clear boundary
- multiple developers can work with less collision
- the project can grow without one huge `services/` folder

### `src/modules/health/`

Minimal feature used to verify the app and database are alive.

Current files:

- `health.module.ts`
- `health.controller.ts`

This module is intentionally tiny and is a good reference for the smallest possible Nest feature.

### `src/modules/users/`

Backend access to internal user data.

Current files:

- `users.module.ts`
- `users.service.ts`

This module is currently small because it only supports auth lookups and login metadata updates.
Later it can grow into internal user management for admin and staff.

### `src/modules/auth/`

Authentication for internal system users.

Current files include:

- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `dto/`
- `guards/`
- `decorators/`
- `auth.types.ts`

This module should contain:

- login flow
- JWT creation and validation
- current user lookup
- role checks for internal users

Important boundary:

- this auth module is for `ADMIN`, `STAFF`, and `SALE`
- the guest portal from the requirement should be implemented as a separate flow later, not mixed into internal auth too early

## Root files in `apps/api`

### `.env.example`

Template of required environment variables.
Commit this file.
Do not commit real secrets in `.env`.

### `package.json`

Contains API dependencies and scripts such as:

- `dev`
- `build`
- `lint`
- `typecheck`
- `db:generate`
- `db:migrate`
- `db:seed`

### `nest-cli.json`

Nest CLI configuration.

### `eslint.config.mjs`

Lint configuration for the API package.

### `tsconfig.json`

TypeScript config used by the editor and type-checking.

### `tsconfig.build.json`

TypeScript config used by Nest build.
It is separated so the editor can still see files like `prisma/seed.ts`, while the build only compiles the runtime app in `src/`.

## What to build next

Based on the current requirement set, the next modules should be added in this order:

1. `apartments`
2. `rooms`
3. `customers`
4. `contracts`
5. `receivables`
6. `payments`
7. `sales`
8. `guest`

Reason:

- `apartments`, `rooms`, `customers`, and `contracts` are the business core
- `receivables` and `payments` sit on top of active contracts
- `sales` depends on contract ownership and commission rules
- `guest` depends on contracts, receivables, payment QR, and guest account rules

## Suggested shape of a new module

At this stage, keep modules simple:

```text
src/modules/rooms/
  dto/
    create-room.dto.ts
    update-room.dto.ts
  rooms.controller.ts
  rooms.service.ts
  rooms.module.ts
```

Meaning:

- `controller`: HTTP input/output
- `service`: feature business logic
- `dto`: request validation and shaping
- `module`: Nest registration for the feature

This is enough for the team to move fast now.
If the project becomes more complex later, each module can be split further into application, domain, and infrastructure layers.
