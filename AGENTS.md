# AGENTS.md

Cyra is a self-hosted movie library and streaming server: a NestJS API (`src/`)
plus a React web app (`web/`) that the API serves in production. See
`README.md` for setup.

## Commands

Server (project root): `npm run start:dev`, `npm test`, `npm run test:e2e`,
`npm run lint`, `npm run format`.
Web (`web/`): `npm run dev`, `npm run typecheck`, `npm run build`,
`npm run format`.

Lint, typecheck and tests must pass before a change is done.

## Server conventions

- ESM with `nodenext`: relative imports end in `.js`; built-ins use the
  `node:` prefix.
- All routes live under `/api/v1`. Every route requires a login unless marked
  `@Public()`; admin-only routes use `@Roles(Role.Admin)`. 401 means
  "not logged in", 403 means "logged in but not allowed". Keep them distinct.
- Response shapes are classes in `.dto.ts` files so the Swagger CLI plugin
  documents them. Never return an entity that holds a secret.
- `users` is the resource, `auth` is the mechanism: `AuthModule` imports
  `UsersModule`, never the reverse.
- `movies` owns the `Movie`, `MediaFile` and `WatchRecord` repositories; other
  modules import `MoviesModule` to use them.
- Bugs in pure functions (parsers, matchers, `parseRange`): add a row to the
  table-driven spec first, then fix the code.

## API contract

`docs/openapi.json` is the frozen contract the web app is built against. After
an intentional API change: start the server, then
`curl http://localhost:3000/docs-json -o docs/openapi.json` and
`npm run gen:api`.

## Web conventions

- Call the API with relative `/api/v1/...` URLs (Vite proxies in dev).
- Server data goes through TanStack Query. Do not hand-edit
  `web/src/api/schema.d.ts`; regenerate it.
- A 401 on an authenticated call ends the session (`web/src/api/http.ts`); a
  403 must never log the user out. Client route guards are UX only; the server
  enforces access.
