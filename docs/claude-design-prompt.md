# Cyra Web Client: Build Brief

You are designing and building the web frontend for **Cyra**, a self-hosted movie library and streaming server. One person runs it at home: Cyra scans a folder of video files, matches each file to a movie on TMDB, and streams it to the browser. Several household accounts can share it, and each account has its own watched state.

I've attached `openapi.json`. It is the frozen v1 API contract and the source of truth for every path, parameter and schema. This brief explains what the API does, the behaviour the schemas don't show, and how each feature should work in the UI. If this brief and the OpenAPI file disagree on a field name or shape, the OpenAPI file wins.

Build every feature listed here. Don't invent features the API can't support: there are no genres, cast, trailers, ratings by users, playback progress, "recently added" or recommendations. Faking them with placeholder data would mislead. Where the API has a gap, this brief says how to handle it.

---

## 1. Product scope

The app has two layers:

- **Viewer layer** (every user): browse, search, open a movie, play it, mark it watched.
- **Admin layer** (role `admin` only): run library scans, review and fix TMDB matches, manage accounts. It lives inside the same app and is hidden from regular users.

Must work on desktop and phone. Keyboard navigation of the poster grid (arrow keys and Enter) is a welcome extra.

---

## 2. Technical ground rules

### Base URL and environment
- The client is a React + TypeScript + Vite app that lives in `web/` and is **served by the Cyra server itself**: Nest serves the built `web/dist` at `/`, and any path outside `/api` and `/docs` falls back to `index.html`, so client-side routes work on refresh. In development, Vite runs on `:5173` and proxies `/api` to Nest on `:3000`.
- Every endpoint lives under `{API_BASE}/api/v1`. `API_BASE` defaults to `''` (same origin), so all calls are relative URLs like `/api/v1/movies`. It can be overridden at build time with the `VITE_API_BASE` env variable (for example, to point a dev build at a server on another machine). Don't add a "Server" field to the login screen.
- API types are generated from `docs/openapi.json` into `web/src/api/schema.d.ts` with `npm run gen:api`. Use those generated types (`components['schemas']`) rather than hand-writing request and response shapes.
- `GET /health` (public) returns `{ status: "Ok" }`. Use it to check the server is reachable before showing login, and show a clear "Can't reach your Cyra server at …" state with a retry button if it fails.
- **Build a mock data layer** that returns data exactly matching the OpenAPI schemas (realistic movie titles and real-looking TMDB poster paths), so the prototype works without a running server. Add a toggle to switch between mock and live. Keep all API calls in one typed client module so the switch is trivial.

### Authentication
- JWT bearer token, valid for 7 days. Send it as `Authorization: Bearer <token>` on every request except the public ones (`/health`, `/auth/status`, `/auth/setup`, `/auth/login`).
- There is **no refresh endpoint and no logout endpoint**. Logging out means throwing away the token on the client.
- **Any `401` from any endpoint means the session is dead.** The token expired, the password was changed, or the user was deleted. Clear the token and send the user to login with a short notice ("Your session ended, sign in again"). Handle this centrally in the API client, not per screen.
- `403` means the user is signed in but not allowed. Show an inline "Admins only" message. Don't log them out.
- After login, call `GET /auth/me` to get `{ id, username, role }`. Base all role checks in the UI on `role` (`"admin"` or `"user"`). Don't decode the JWT.

### Errors
Every error body is `{ statusCode, message, error }`, and `message` is **either a string or an array of strings**. Validation failures (`400`) return an array. Map those messages to the matching form fields where you can, otherwise list them under the form. Always handle both shapes.

### Pagination
List endpoints take `page` (from 1) and `size` (1–100, default 20) and return `{ items, page, size, total }`. Work out the page count as `ceil(total / size)`. Use infinite scroll for the movie grid and numbered pagination for admin tables.

### Images (TMDB)
`posterPath` and `backdropPath` are **paths like `/abc.jpg`, not URLs**, and either can be `null`. Build the URL as `https://image.tmdb.org/t/p/{size}{path}`:
- Poster in the grid: `w342`. Poster on the detail page: `w780`. Tiny thumbnails in admin tables: `w92`.
- Backdrop hero: `w1280` (or `original` on large screens).
- When the value is `null`, use a fallback placeholder that shows the title and year. Never show a broken image.

---

## 3. First run and sign-in

### Boot sequence (on every app load)
1. `GET /health`. If it fails, show the "Can't reach server" state.
2. `GET /auth/status` returns `{ needsSetup: boolean }`.
   - `true` means this is a fresh install. Go to **Setup**.
   - `false` and no stored token: go to **Login**.
   - `false` with a stored token: call `GET /auth/me`. On success go to the Library; on `401` go to Login.

### Setup screen (first-run admin creation)
- Shown only while `needsSetup` is true. Welcome copy: "Create the admin account for your Cyra server."
- Fields: username (3–32 chars) and password (8–128 chars, with a confirm field). Validate on the client to match.
- `POST /auth/setup` with `{ username, password }` returns the created user, **not a token**. Call `POST /auth/login` straight away with the same credentials so the admin lands signed in.
- `409` means setup was already done (someone else got there first). Send them to Login.
- After setup, take the admin to an **onboarding empty state** in the Library: "Your library is empty. Scan your media folder to get started", with a primary button that starts a scan (see §6).

### Login screen
- Username and password. `POST /auth/login` returns `{ accessToken }`.
- `401` returns the single message "Invalid username or password". Show it generically and don't say which field was wrong.
- Usernames are stored lowercase and trimmed, so sign-in is case-insensitive. Don't block uppercase input.
- Include the "Server" address field (collapsed by default).

---

## 4. Viewer layer

### 4.1 Library (home)
`GET /movies?page&size&search&year` returns `{ items: MovieListItem[], page, size, total }`.

`MovieListItem = { id, tmdbId, title, year|null, posterPath|null, watched }`

- Only **matched** movies appear here. Files that haven't been matched yet don't show up until an admin matches them.
- The server always sorts by title A→Z. There's no other sort option, so don't offer one.
- **Hero banner**: list items don't include a backdrop. Pick one movie from the loaded page (prefer an unwatched one), fetch `GET /movies/{id}`, and use its `backdropPath`, `title`, `tagline`, `overview` and a Play button. Skip the hero if nothing has a backdrop.
- **Poster grid**: responsive, infinite scroll (`size=40` works well). Each card shows the poster, title and year, plus a "Watched" badge or check when `watched` is true. On hover or focus, show a quick watched toggle (see 4.3) and a play shortcut that opens the detail page's player.
- **Search**: `search` is a case-insensitive substring match on the title. Debounce it (~300 ms), reflect it in the URL (`?q=`), and reset to page 1 when it changes.
- **Year filter**: `year` is an exact match. Offer it as a year picker or an input next to search. Show active filters as removable chips.
- **Watched filter**: the API **can't** filter by watched. If you offer "Hide watched", label it as filtering only the loaded results, or leave it out. Don't build home rows like "Unwatched" that need server-side filtering.
- **Empty states** (each one distinct):
  - Library empty and user is admin: "Scan your media folder" CTA.
  - Library empty and user is a regular user: "Nothing here yet. Ask your admin to scan the library."
  - No search results: "No movies match '…'", with a clear-filters button.
- Loading state: skeleton poster cards. Error state: inline retry.

### 4.2 Movie detail page
`GET /movies/{id}` returns `MovieDetail`: everything in the list item plus `overview, tagline, runtime (minutes), backdropPath, voteAverage (0–10), voteCount, imdbId` (all nullable) and `files: MediaFile[]`.

`MediaFile = { id, relativePath, parsedTitle, parsedYear|null, sizeBytes, matchStatus: "matched"|"manual"|"unmatched", matchScore|null }`

Content: backdrop, poster, title, year, runtime formatted as "2h 14m", TMDB rating shown as "7.8 ★ (12,345 votes)", tagline, overview, and an "IMDb" link to `https://www.imdb.com/title/{imdbId}` when `imdbId` is present. Hide any field that is null. Don't render empty labels.

Actions:
- **Play** (primary). Opens the player for the chosen file (see 4.4).
- **Watched toggle** (see 4.3).
- **Versions / files**: a movie can have **several files** (for example a 1080p and a 4K copy). With more than one, show a version picker listing each file's name (the last segment of `relativePath`), extension or container badge, size in readable form (`sizeBytes` → "4.2 GB"), and a browser playback badge (see 4.4). With exactly one, just show its details in a small "File info" section.
- **No files** (`files: []`). This happens when a movie's files were removed from disk and a later scan dropped them. Show "This movie's file is no longer in your library" and disable Play.
- `404` means the movie doesn't exist. Show a proper not-found page with a link back to the Library.
- For admins only: an "Admin" section that shows each file's `matchStatus` and `matchScore` and has a **"Fix match"** button opening the match dialog from §6.3.

### 4.3 Watched state
- `PUT /movies/{id}/watched` marks it watched (`204`). `DELETE /movies/{id}/watched` unmarks it (`204`). Both are idempotent.
- Watched state belongs to each user. The server stores no progress and no timestamp you can read, only a yes/no.
- Update **optimistically** everywhere (grid card, detail page, hero) and roll back with a toast if the call fails.
- Nice touch: when playback reaches roughly the last 5% of the video, offer "Mark as watched?" (or mark it automatically and show an undo toast).

### 4.4 Player
Stream URL: `GET /files/{fileId}/stream`. It supports HTTP Range requests (`206 Partial Content`), so seeking works natively.

- `<video>` elements can't send headers, so this endpoint **accepts the token as a query parameter**: `src = {API_BASE}/api/v1/files/{fileId}/stream?token={accessToken}`. The browser handles Range by itself; don't fetch the file in JavaScript. Because `API_BASE` is usually `''`, anything that leaves the browser (Copy stream URL, Download) must be made absolute first, e.g. `new URL(path, window.location.origin).href`, or an external player like VLC can't open it.
- Player features: movie title, standard controls, fullscreen, keyboard shortcuts (space, ←/→ ±10 s, F for fullscreen, M to mute), and a back button to the detail page.
- **Browser compatibility**, worked out from the file extension in `relativePath`:
  - `.mp4`, `.m4v`, `.webm`: plays in browser. Badge: "Plays in browser".
  - `.mkv`, `.mov`: may play, depending on the browser and codecs. Badge: "May not play in browser". Try it, and if the `<video>` fires an `error` (or never gets metadata), switch to the fallback panel.
  - `.avi`, `.wmv`, `.flv`, `.mpg`, `.mpeg`, `.ts`: won't play in a browser. Badge: "External player". Go straight to the fallback panel.
- **Fallback panel** ("Open in an external player"): explain that the file needs a player like VLC. Offer **Copy stream URL** (the tokenized URL) and **Download** (same URL). Next to those, show this warning: *"This link contains your sign-in token. Anyone with it can stream as you until it expires or you change your password. Don't share it."*
- Stream errors: `404` means the file record is gone or the file is missing on disk ("This file can't be found on the server"). `401` follows the global session rule.

### 4.5 Account settings (every user)
- Shows username and role (from `/auth/me`).
- **Change password**: current password, new password (8–128), confirm. `PATCH /auth/change-password` with `{ currentPassword, newPassword }` returns `204`.
  - `403` means the current password is wrong. Show the error on that field.
  - **On success the server revokes every token, including the one in use.** Before submitting, tell the user they'll be signed out on all devices. After `204`, clear the token and send them to Login with "Password changed. Sign in with your new password."
- **Sign out**: clear the token and go to Login.

---

## 5. Navigation and routes

Suggested routes (the URL should hold the state so pages can be shared and the back button works):

| Route | Who | Purpose |
|---|---|---|
| `/setup` | public, only while `needsSetup` | First-run admin creation |
| `/login` | public | Sign in |
| `/` | all | Library: hero, search, filters, grid |
| `/movie/:id` | all | Movie detail |
| `/watch/:fileId` | all | Player |
| `/account` | all | Profile, change password, sign out |
| `/admin` | admin | Dashboard: library stats, scan/match controls, current job |
| `/admin/files` | admin | All files, filtered by match status |
| `/admin/users` | admin | Account management |

Top navigation: logo, Library, search box (always visible), and an avatar menu (Account, Admin for admins only, Sign out). Admins also see a small **job indicator** in the nav while a scan or match is running (see §6.1), so they can keep browsing.

Route guards: unauthenticated users go to `/login`; non-admins on `/admin/*` go to `/`.

---

## 6. Admin layer

### 6.1 Background jobs: the shared engine
Scanning and matching both run in the background as **jobs**. Only **one job can run at a time** across the whole server.

`Job = { id, kind: "scan"|"matchall", status: "running"|"completed"|"failed", startedAt, finishedAt|null, progress: { done, total }|null, error|null, result|null }`

- Starting a job returns `202` with the Job object.
- `GET /jobs/current` returns the **most recent** job: running, or the last one that finished. It returns **`404` when no job has run since the server started**, which is a normal "idle, no history" state, not an error.
- **`409`** on start means another job is already running. Don't show an error. Fetch `/jobs/current` and show that job's progress ("A match is already running…").
- Jobs live only in memory. A server restart forgets them (`/jobs/current` goes back to `404`), but anything a job already saved stays.
- **Polling**: while `status === "running"`, poll `GET /jobs/current` about every second. Stop when it's `completed` or `failed`. When an admin opens the app, poll once to pick up a job that's already running. Keep the job state in a global store so the nav indicator, dashboard and toasts stay in sync.
- **Progress**: `progress` can be `null` (just started, or a scan, which doesn't report progress). When it's null, show an indeterminate bar. Otherwise show a determinate bar with "done / total".
- When a job finishes: show a toast and refresh the affected data (the movie grid and the files table).
- `failed`: show the `error` text as a failure result, with a retry button.

### 6.2 Admin dashboard (`/admin`)
- **Library stats** built from `total` fields (cheap calls with `size=1`): total movies (`/movies`), total files (`/files`), and matched / manual / unmatched counts (`/files?status=…`). Make "unmatched" a prominent call to action that links to the Files view filtered to unmatched.
- **Scan library**: `POST /scanner`. Explain it: "Looks through your media folder for new video files and removes entries for files that no longer exist. Extras folders (featurettes, trailers, samples…) are skipped." Scanning only indexes files; it doesn't match them.
  - Result: `{ scannedVideoItemsCount, currentItemsCount, removedStaleCount }`. Show "Found X video files · Y in library · Z removed".
- **Match to TMDB**: `POST /matcher/matchall`. Explain it: "Looks up every **unmatched** file on TMDB. Files that are already matched or were fixed by hand are never touched."
  - Result: `{ total, matched, unmatched: UnmatchedFile[], failed: FailedFile[] }`
  - `UnmatchedFile = { title, relativePath, cause, candidates?: (TmdbMovie & { score })[] }`. `candidates` is the top 3 TMDB results with a similarity score from 0 to 1, present when TMDB returned results but none scored at least 0.8.
  - `FailedFile = { title, relativePath, cause }`: errors such as TMDB being unreachable. These files stay unmatched and will be retried on the next run.
  - Present the result as a **match review screen**: a summary ("42 matched · 5 need review · 1 failed"), then one row per unmatched file showing its path, the cause, and its candidates, each with poster, title, year and a score shown as a percentage. **One click on a candidate accepts it** (`PATCH /files/{id}/match`, see 6.3). Each row also has "Search TMDB…" to open the full match dialog.
  - ⚠️ **API gap**: unmatched entries come with `relativePath` but **no file id**, and `PATCH /files/{id}/match` needs the id. To work around it, after a match job finishes, load `GET /files?status=unmatched` (page through it with `size=100`), build a map from `relativePath` to `id`, and use that map to resolve ids. Put this in a single helper.
  - The job result stays readable from `/jobs/current` until the next job starts. Make "Review last match results" reachable from the dashboard while it's available.
- **Suggested flow**: show the two steps as a clear pipeline, **1. Scan → 2. Match → 3. Review**, and offer to start matching right after a scan that found new files.

### 6.3 Files view (`/admin/files`)
`GET /files?page&size&status` returns `{ items: MediaFile[], … }`. Sorted by parsed title. `status` is `matched`, `unmatched` or `manual`. This is the only filter; there's no text search.

- A table with status tabs (All / Unmatched / Matched / Manual) that carry counts.
- Columns: file name (full `relativePath` on hover or expand), parsed title and year (what the scanner read from the filename), size, status badge, and match score. Show the score as a percentage for `matched`, "—" for `manual` (manual matches have a null score), and nothing for `unmatched`. Highlight low-confidence auto-matches (score below roughly 0.9) so admins can spot-check them.
- **List items do not include the linked movie.** For that, use `GET /files/{id}`, which returns the file **with `movie`** (a full Movie or `null`). Show it in a side drawer when a row is clicked: file details, the linked movie's poster and title (linking to the movie page), and a Play-this-file button.
- **Fix match / match manually** (opens from the drawer, the review screen, or the movie page's admin section):
  1. A search dialog prefilled with the file's `parsedTitle` and `parsedYear`.
  2. `GET /matcher/search-tmdb?title&year&page` (admin only; `title` is 1–100 chars, `year` optional) returns `{ items: TmdbMovie[], page, totalPages, totalResults }`, where `TmdbMovie = { id, title, originalTitle, year|null, posterPath|null }`. Show each result's poster, title and year (and `originalTitle` when it differs from `title`), with "Load more" when `page < totalPages`.
  3. Picking a result calls `PATCH /files/{id}/match` with `{ tmdbId }`. It returns the updated MediaFile, now with `matchStatus: "manual"`, `matchScore: null` and `movie` set. If the movie wasn't in the library yet it gets created, so the movie grid has a new entry.
  - Errors: `404` means the file is gone or TMDB has no such id. `502` means TMDB is unreachable or returned an error ("TMDB is unavailable right now, try again shortly"), and applies to search too. `400` means an invalid id.
  - There's **no unmatch endpoint**. A wrong match can only be fixed by matching the file to the correct movie. Don't offer an "Unmatch" button.
- Files the scanner can't parse well (odd parsed titles) are exactly the ones admins will fix by hand, so make the parsed title prominent next to the filename.

### 6.4 Users (`/admin/users`)
- `GET /users?page&size&search` returns `{ items: { id, username, role }[], … }`. `search` is a username substring match. Show a table with a role badge and mark the current user's row "You".
- **Add user**: `POST /users` with `{ username (3–32), password (8–128), role?: "admin"|"user" }`. Role defaults to `user`. Returns `201` with the new user. `409` means the username is taken (usernames are compared case-insensitively). Tell the admin to share the password with the person themselves, since there's no invite email.
- **Delete user**: `DELETE /users/{id}` returns `204`, after a confirmation dialog that names the user. Their watched history is deleted too, so say so in the dialog. `403` means you tried to delete yourself, so disable that action on your own row anyway. `404` means already deleted; just refresh.
- **Not supported by the API** (so leave out): editing a user, changing someone's role, and resetting someone else's password. If a user forgets their password, the admin deletes the account and recreates it. A short help note explaining this is useful.

---

## 7. Cross-cutting quality bar

- **Every data view has four states**: loading (skeletons), empty, error (with retry), and populated.
- **Toasts** for background outcomes: job finished, watched toggled with undo, match saved.
- **Confirmations** for destructive or session-ending actions: delete user, change password.
- **Formatting helpers**: bytes → GB/MB, minutes → "2h 14m", vote → one decimal, score → percentage, ISO dates → relative time ("started 2 min ago").
- **Accessibility**: real buttons and links, visible focus rings on poster cards, alt text on posters (`"{title} poster"`), and labelled form fields with inline errors.
- **Performance**: lazy-load poster images, keep previously loaded grid pages in memory when moving between the grid and detail pages, and restore scroll position when coming back to the Library.
- **Cache invalidation**: after a scan, match or manual match, refetch the movie list and file lists. After a watched toggle, update cached list and detail entries in place.

---

## 8. Endpoint checklist

Every endpoint must be wired to the UI described above:

| Method & path | Auth | Used by |
|---|---|---|
| `GET /health` | public | Boot check, server picker |
| `GET /auth/status` | public | Boot: setup or login |
| `POST /auth/setup` | public | Setup screen |
| `POST /auth/login` | public | Login, auto-login after setup |
| `GET /auth/me` | user | Session restore, role gating, account page |
| `PATCH /auth/change-password` | user | Account page (forces re-login) |
| `GET /movies` | user | Library grid, search, year filter, dashboard count |
| `GET /movies/{id}` | user | Detail page, hero banner |
| `PUT /movies/{id}/watched` | user | Watched toggle, end-of-playback prompt |
| `DELETE /movies/{id}/watched` | user | Watched toggle, undo |
| `GET /files/{id}/stream?token=` | user | Player, copy URL, download |
| `GET /files` | user* | Admin files table, status counts, id lookup for review |
| `GET /files/{id}` | user* | Admin file drawer (includes linked movie) |
| `PATCH /files/{id}/match` | admin | Manual match, one-click candidate accept |
| `GET /matcher/search-tmdb` | admin | Manual match dialog |
| `POST /scanner` | admin | Scan library |
| `POST /matcher/matchall` | admin | Match to TMDB |
| `GET /jobs/current` | admin | Job polling, nav indicator, last results |
| `GET /users` | admin | Users table |
| `POST /users` | admin | Add user |
| `DELETE /users/{id}` | admin | Delete user |

\* `GET /files` and `GET /files/{id}` technically allow any signed-in user, but only the admin UI needs them. Regular users get file info from `GET /movies/{id}`.
