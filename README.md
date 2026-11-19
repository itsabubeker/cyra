# Cyra

A self-hosted movie library and streaming server. Cyra scans a folder of video
files, matches them to movies on TMDB, and streams them to the browser, with
per-user accounts and watched state.

Built with NestJS, TypeORM and SQLite.

## Setup

```bash
npm install
```

Create a `.env` file in the project root:

| Variable       | Required | Description                                              |
| -------------- | -------- | -------------------------------------------------------- |
| `MEDIA_DIR`    | yes      | Folder that holds your video files, e.g. `E:\Movies`     |
| `TMDB_API_KEY` | yes      | TMDB API read access token (v4 "Bearer" token)           |
| `JWT_SECRET`   | yes      | Long random string used to sign login tokens             |
| `DB_PATH`      | no       | SQLite file, defaults to `data/media.db`                 |
| `PORT`         | no       | HTTP port, defaults to `3000`                            |

## Run

```bash
npm run start:dev    # watch mode
npm run build && npm run start:prod
```

The API is served under `/api/v1`. Interactive docs are at
`http://localhost:3000/docs`.

## First run

1. `GET /api/v1/auth/status` returns `{ "needsSetup": true }` on a fresh install.
2. `POST /api/v1/auth/setup` with `{ "username", "password" }` creates the
   admin account. It only works while no users exist.
3. `POST /api/v1/auth/login` returns an `accessToken`. Send it as
   `Authorization: Bearer <token>`.
4. As admin, `POST /api/v1/scanner` to index `MEDIA_DIR`, then
   `POST /api/v1/matcher/matchall` to match files to TMDB. Both run in the
   background; poll `GET /api/v1/jobs/current` for progress.

## Tests

```bash
npm test             # unit tests
npm run test:e2e     # end-to-end, uses an in-memory database
```

## API contract

[`docs/openapi.json`](docs/openapi.json) is the frozen API description the
frontend is built against. Change it on purpose, not by accident: after an API
change, start the server and regenerate it:

```bash
curl http://localhost:3000/docs-json -o docs/openapi.json
```

## Things to know

- **Stream URLs carry your login token.** `<video>` tags cannot send an
  `Authorization` header, so `GET /files/:id/stream` also accepts
  `?token=<accessToken>`. Anyone with that URL can stream as you until the
  token expires (7 days) or you change your password. Don't share it.
- **Changing your password signs you out everywhere**, including the session
  that made the change. Every existing token stops working, so log in again.
- **Background jobs live in memory.** Only one scan or match runs at a time
  (a second one gets `409`). Restarting the server forgets the current job;
  the files and matches it already saved stay in the database.
- **Not every file plays in a browser.** MP4, M4V and WebM play everywhere;
  MKV and MOV depend on the browser and codecs; AVI, WMV, FLV, MPEG and TS
  are listed and streamed but need an external player such as VLC.
- **The database schema syncs automatically** (`synchronize: true`). That is
  fine for development; switch to migrations before relying on the data.
