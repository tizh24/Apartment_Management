# Vercel Deployment

This repo should be deployed to Vercel as two separate projects in the same monorepo:

- `apps/web` for the Next.js frontend
- `apps/api` for the NestJS backend

This is the recommended setup because Vercel Services is currently in private beta. Two normal Vercel projects are simpler and more stable for this repo.

## Why this setup

- `apps/web` is a standard Next.js app and works naturally on Vercel.
- `apps/api` is a NestJS app and Vercel supports NestJS as a single Vercel Function with zero-config entrypoint detection when `src/main.ts` exists.
- The API can be placed near the database region to reduce latency.

## Project 1: API

Create a Vercel project with:

- Root Directory: `apps/api`
- Framework Preset: auto-detect NestJS

Environment variables to add in Vercel:

- `NODE_ENV=production`
- `APP_NAME=Apartment Management API`
- `SWAGGER_ENABLED=false`
- `DATABASE_URL=...`
- `JWT_ACCESS_SECRET=...`
- `JWT_ACCESS_EXPIRES_IN=1d`

Notes:

- `apps/api/vercel.json` pins the API function region to `syd1`, which matches your RDS region `ap-southeast-2` closely.
- You do not need to manually set `PORT` on Vercel.
- Do not run `prisma migrate dev` in production.
- Apply production migrations with:

```bash
pnpm --filter @apartment/api exec prisma migrate deploy
```

## Project 2: Web

Create a second Vercel project with:

- Root Directory: `apps/web`
- Framework Preset: Next.js

Environment variable to add in Vercel:

- `NEXT_PUBLIC_API_URL=https://<your-api-project>.vercel.app/api/v1`

After the API project gets its first deployment URL, update this value in the web project and redeploy the frontend.

## Importing the monorepo

When importing the Git repository into Vercel:

1. Create the API project first and select `apps/api` as Root Directory.
2. Create the Web project second and select `apps/web` as Root Directory.
3. Keep both projects connected to the same repository.

Vercel supports monorepos by assigning each project its own Root Directory.

## Local commands

Useful commands before deployment:

```bash
pnpm install
pnpm --filter @apartment/api db:generate
pnpm --filter @apartment/api typecheck
pnpm --filter @apartment/api build
pnpm --filter @apartment/web typecheck
pnpm --filter @apartment/web build
```

## Optional follow-up

If later you want preview deployments of the web app to automatically talk to preview deployments of the API, use Vercel Related Projects after both projects exist. That step needs real Vercel project IDs, so it is not added in this repo yet.
