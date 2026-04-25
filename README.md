# ScopeNod

A mobile-first field camera that creates customer-acknowledged Service Records.

## Prototype Routes

- `/` - worker Today screen
- `/jobs/honda-accord/scope` - worker scope handoff
- `/jobs/honda-accord/capture` - guided proof camera
- `/jobs/honda-accord/review` - review reel
- `/ack/scope-demo` - customer scope review
- `/ack/completion-demo` - customer completion review
- `/record/demo` - final Service Record
- `/moodboard` - visual moodboard reference

## Tomorrow Test Scope

This build is a deployable pilot prototype, not the full production backend.

Ready to test:

- brand direction and visual feel
- worker Today screen
- new job shell
- async scope handoff
- guided capture flow
- review reel
- customer scope review
- customer completion review
- final Service Record
- moodboard/product-direction references

Not production-real yet:

- Neon database persistence
- Auth account creation/login
- Vercel Blob uploads
- real camera/file capture
- real AI verification calls
- SMS/email sending

## Production Backend Next

To make ScopeNod fully real, wire these in next:

1. Neon Postgres + Drizzle schema for jobs, scope items, photos, acknowledgements, exceptions, records, and audit events.
2. Auth.js magic-link sign-in with organization/user membership.
3. Vercel Blob upload tokens for raw originals, display images, and thumbnails.
4. Browser capture/file upload with client resize/compression.
5. AI adapter behind `GEMINI_MODEL_ID` with stub/live modes.
6. Tokenized customer links for `/ack/:token` and `/record/:token`.
7. Audit events for scope sent/viewed/acknowledged, photo captured, exception added, completion approved, and record generated.

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

Production builds work normally in clean paths such as CI/Vercel. In this local OneDrive path, Next's webpack production file tracing can misread the `DATA#3 LIMITED` segment. During local validation, build from a temporary drive alias:

```powershell
subst S: "C:\Users\Adam Rappaport\OneDrive - DATA#3 LIMITED\Documents\scopenod"
cd /d S:\
npm run build
```
