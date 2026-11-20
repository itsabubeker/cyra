# Cyra

A self-hosted movie library and streaming server. Cyra scans a folder of video
files, matches them to movies on TMDB, and streams them to the browser, with
per-user accounts and watched state.

- **Server:** NestJS, TypeORM and SQLite (project root, `src/`)
- **Web app:** React, Vite, React Router, TanStack Query, Tailwind CSS,
  shadcn/ui and Video.js (`web/`)

In production the server also serves the web app, so there is only one thing
to run and one address to open.

## Requirements

- [Node.js](https://nodejs.org) 22 or newer (includes npm)
- A [TMDB](https://www.themoviedb.org/settings/api) account for an API read
  access token (free)
- A folder of movie files

## 1. Install

The server and the web app each have their own dependencies, so install both:

```bash
npm install
npm --prefix web install
```

## 2. Configure

Create a `.env` file in the project root:

```env
MEDIA_DIR=E:\Movies
TMDB_API_KEY=your-tmdb-read-access-token
JWT_SECRET=a-long-random-string
```

| Variable       | Required | Description                                                   |
| -------------- | -------- | ------------------------------------------------------------- |
| `MEDIA_DIR`    | yes      | Folder that holds your video files, e.g. `E:\Movies`          |
| `TMDB_API_KEY` | yes      | TMDB **API Read Access Token** (the long v4 "Bearer" token)   |
| `JWT_SECRET`   | yes      | Long random string used to sign login tokens                  |
| `DB_PATH`      | no       | SQLite file, defaults to `data/media.db` (created on startup) |
| `PORT`         | no       | HTTP port, defaults to `3000`                                 |

To generate a `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## 3. Run

### For everyday use (production)

Build everything once, then start the server:

```bash
npm run build
npm run start:prod
```

Open **http://localhost:3000**. Run `npm run build` again after pulling new
changes.

### While developing

Use two terminals. The server restarts when you change `src/`, and the web app
reloads instantly when you change `web/src/`:

```bash
# terminal 1: API on http://localhost:3000
npm run start:dev

# terminal 2: web app on http://localhost:5173
npm run dev:web
```

Open **http://localhost:5173**. Vite forwards every `/api` request to the
server on port 3000, so both must be running.

## 4. First run

1. Open the app. On a fresh install it asks you to **create the admin
   account**. This screen only appears while no users exist.
2. You land in an empty library. Click **Scan media folder** to index the
   files in `MEDIA_DIR`.
3. Then click **Match to TMDB** (the library and the Admin dashboard both
   offer it). Movies appear in the library when matching finishes.
4. Open **Admin → Review** for files TMDB couldn't place with confidence, and
   pick the right movie in one click or search TMDB yourself.
5. Add accounts for other people under **Admin → Users**. There is no invite
   email, so share their password with them yourself.

## Scripts

Run these from the project root.

| Command              | What it does                                                 |
| -------------------- | ------------------------------------------------------------ |
| `npm run start:dev`  | Starts the API in watch mode                                 |
| `npm run dev:web`    | Starts the web app dev server (Vite) on port 5173            |
| `npm run build`      | Builds the web app into `web/dist`, then the server into `dist` |
| `npm run start:prod` | Runs the built server, which also serves the built web app   |
| `npm test`           | Server unit tests                                            |
| `npm run test:e2e`   | Server end-to-end tests (in-memory database)                 |
| `npm run lint`       | Lints the server code                                        |
| `npm run gen:api`    | Regenerates the web app's API types from `docs/openapi.json` |

Inside `web/`: `npm run typecheck` checks types and `npm run format` formats
the web code with Prettier.

## Project layout

```
src/                  NestJS server, one folder per module (auth, movies, files, ...)
test/                 Server end-to-end tests
docs/openapi.json     Frozen API contract the web app is built against
docs/design/          UI design reference
web/src/
  api/                Fetch client, error type and generated API types
  app/                Providers, query client and the route tree
  components/ui/      shadcn/ui components, styled for Cyra
  components/shared/  Reusable pieces: poster, empty/error states, form fields...
  components/layout/  Top nav, phone tab bar, page shell
  features/           One folder per area: auth, movies, player, account, files, admin
  hooks/, lib/        Small generic hooks and helpers (formatting, TMDB images...)
  styles/index.css    Design tokens (colours, fonts) and Tailwind setup
```

## API

The API is served under `/api/v1`. Interactive docs are at
`http://localhost:3000/docs`.

[`docs/openapi.json`](docs/openapi.json) is the frozen API description the web
app is built against. Change it on purpose, not by accident: after an API
change, start the server, regenerate it, then regenerate the web app's types:

```bash
curl http://localhost:3000/docs-json -o docs/openapi.json
npm run gen:api
```

## Troubleshooting

- **"Can't reach your Cyra server"**: the API isn't running. In development,
  start `npm run start:dev` as well as `npm run dev:web`.
- **"Not Found" at http://localhost:3000**: the web app hasn't been built.
  Run `npm run build`.
- **A movie won't play / "Open in an external player"**: either the browser
  can't decode that file (see below), or the file isn't reachable. Check that
  `MEDIA_DIR` points at a folder that exists (an unplugged external drive
  causes this).
- **Movies have no backdrop or description**: those details are saved when a
  movie is first matched. Movies matched before details were added don't have
  them yet.
- **Signed out unexpectedly**: logins last 7 days, and changing your password
  signs out every device.

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
  are listed and streamed but need an external player such as VLC. The app
  offers a copy-link and download option for those.
- **The database schema syncs automatically** (`synchronize: true`). That is
  fine for development; switch to migrations before relying on the data.
