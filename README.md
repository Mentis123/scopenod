# ScopeNod

A mobile-first service-proof app for capturing scope, photos, exceptions, customer acknowledgements, and shareable Service Records.

## Prototype Routes

- `/` - worker Today screen
- `/jobs/honda-accord/scope` - worker scope handoff
- `/jobs/honda-accord/capture` - guided proof camera
- `/jobs/honda-accord/review` - review reel
- `/ack/scope-demo` - customer scope review
- `/ack/completion-demo` - customer completion review
- `/record/demo` - final Service Record
- `/moodboard` - visual moodboard reference

## Backend Status

The pilot now includes a real backend foundation:

- Neon Postgres schema via Drizzle
- tokenized scope/completion/Service Record links
- job creation API and server action
- customer acknowledgement API and server action
- Service Record lookup API
- Vercel Blob client-upload route foundation
- mobile capture/file picker with client-side image resize
- uploaded proof photo registration against jobs
- Gemini photo-check adapter with `stub` and `live` modes
- backend health endpoint at `/api/health`
- automatic pilot org/template seeding on first real job creation

The current UI still keeps polished demo content where the capture surface and customer pages are not fully data-bound yet. The persistence, token, upload, and AI boundaries are in place for the next implementation pass.

## Required Environment Variables

Set these in Vercel for Production, Preview, and Development as needed:

- `DATABASE_URL` - Neon pooled Postgres connection string.
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob store read/write token.
- `NEXT_PUBLIC_APP_URL` - deployed app origin, for example `https://scopenod.vercel.app`.
- `AI_MODE` - use `stub` for no-cost checks or `live` to call Gemini.
- `GEMINI_API_KEY` - required when `AI_MODE=live`.
- `GEMINI_MODEL_ID` - optional, defaults to `gemini-3-flash-preview`.
- `GEMINI_API_URL` - optional, defaults to Google's `v1beta` Gemini API base URL.

Do not commit real secret values. Use `.env.example` as the shape only.

## Backend Routes

- `GET /api/health` - reports whether DB, Blob, and Gemini are configured.
- `GET /api/jobs` - returns real jobs when DB is configured, demo fallback otherwise.
- `POST /api/jobs` - creates a real job shell and seeds the pilot workspace if needed.
- `POST /api/jobs/:jobId/approval-links` - creates scope, completion, or Service Record links.
- `GET /api/ack/:token` - resolves a customer acknowledgement token.
- `POST /api/ack/:token` - records customer acknowledgement.
- `GET /api/service-records/:token` - resolves a public Service Record token.
- `POST /api/photo-checks` - calls the photo verification adapter.
- `POST /api/uploads/proof` - creates/listens for Vercel Blob client uploads.

## Still To Make Fully Real

- bind customer pages completely to live DB payloads
- add local draft retry queue for failed/pending uploads
- bind uploaded photos into customer pages and Service Records
- add Auth.js or equivalent worker login
- add completion-link generation in the worker UI
- add operator/business profile screens
- add legal-reviewed production acknowledgement copy

## Run Locally

```bash
npm install
npm run dev
```

The dev script uses Turbopack because the local OneDrive path contains `#`, which breaks the default Next.js webpack dev manifest on Windows.

Open:

```text
http://127.0.0.1:3000
```

## Validate

```bash
npm run typecheck
npm run build
```

Database migration commands:

```bash
npm run db:generate
npm run db:push
```

`db:push` applies the Drizzle schema directly to the configured Neon database.

Production builds work normally in clean paths such as CI/Vercel. In this local OneDrive path, Next's webpack production file tracing can misread the `DATA#3 LIMITED` segment. During local validation, build from a temporary drive alias:

```powershell
subst S: "C:\Users\Adam Rappaport\OneDrive - DATA#3 LIMITED\Documents\scopenod"
cd /d S:\
npm run build
```
