# ScopeNod Agent Handoff

This file is the continuity guide for Codex, Claude, and any other coding agent picking up ScopeNod.

## Product Direction

ScopeNod is a mobile-first web app for service-proof workflows:

1. Capture the condition.
2. Confirm the scope.
3. Show the work.
4. Handle exceptions.
5. Get a customer nod.
6. Leave a trusted Service Record.

Keep V1 as a mobile web app. Do not move to native iOS/Android unless field testing proves browser limits are blocking the workflow. The UX should feel like an installed app inside mobile Safari/Chrome, not a responsive web page. On real mobile, avoid decorative phone mock frames and side panels that create horizontal overflow.

Primary visual reference:

- `public/scopenod_moodboard.png`
- `public/scopenod_product_direction.png`
- `docs/roadmap-notes.md`
- `ScopeNod_PRD_final.md`

Tone: premium, durable, calm, direct, field-grade, photographic, trustworthy. Avoid AI-sparkle decoration, purple-gradient SaaS, legalistic language, and blockchain-forward copy.

## Current Technical State

Repo:

- GitHub: `https://github.com/Mentis123/scopenod`
- Main branch: `main`
- Deployed by Vercel from `origin/main`
- Local working directory used in this session: `C:\Users\Adam Rappaport\OneDrive - DATA#3 LIMITED\Documents\scopenod`

Stack:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Neon Postgres
- Vercel Blob
- Gemini photo-check adapter
- `react-qr-code` for generated customer handoff QR codes

Backend foundation is real:

- Neon schema exists and migrations are committed in `drizzle/`
- job creation persists
- pilot org/template auto-seed on first real job creation
- approval links are tokenized
- upload route integrates with Vercel Blob client uploads
- uploaded photos register against jobs
- exception-mode capture creates linked exception records
- Service Record route can resolve real record tokens and live job/photo data
- Gemini adapter supports `AI_MODE=stub` and `AI_MODE=live`

Still partly demo-bound:

- customer `/ack/:token` UI still needs deeper live payload binding and polished read-only expired/used states
- Service Record live binding exists, but needs richer acknowledgement/history/photo categorization
- review reel reads live uploaded photos, but needs retake/note/mark-exception controls
- worker auth/business profile are not implemented
- local upload retry queue/offline draft protection is not implemented

## Important Environment Variables

Never commit real secret values.

Required in Vercel:

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `NEXT_PUBLIC_APP_URL`
- `AI_MODE`
- `GEMINI_API_KEY` when `AI_MODE=live`

Optional:

- `GEMINI_MODEL_ID`
- `GEMINI_API_URL`

Use `.env.example` for the expected shape.

Important security note: a Neon URL was pasted in chat during development. Do not put it in git. Rotate the Neon password before any real pilot/customer use.

## Development Commands

Install:

```bash
npm install
```

Run dev:

```bash
npm run dev
```

Validate:

```bash
npm run typecheck
npm run build
```

Database:

```bash
npm run db:generate
npm run db:push
```

Local Windows path gotcha:

The local OneDrive folder contains `DATA#3 LIMITED`. Turbopack is used for dev because default webpack dev can misread the `#`. Production build validation from the real path can also misread it, so use a subst drive:

```powershell
subst S: "C:\Users\Adam Rappaport\OneDrive - DATA#3 LIMITED\Documents\scopenod"
cd /d S:\
npm run build
```

## Key Routes

Worker:

- `/` - Today screen
- `/jobs/new` - real job creation shell
- `/jobs/:jobId/scope` - scope handoff with generated QR
- `/jobs/:jobId/capture` - capture/upload flow
- `/jobs/:jobId/review` - review reel and completion handoff

Customer/public:

- `/handoff/:jobId?purpose=scope|completion|service_record` - creates/routes to the current live handoff URL
- `/ack/:token` - customer scope/completion review
- `/record/:token` - Service Record

API:

- `GET /api/health`
- `GET /api/jobs`
- `POST /api/jobs`
- `POST /api/jobs/:jobId/approval-links`
- `POST /api/jobs/:jobId/photos`
- `GET /api/ack/:token`
- `POST /api/ack/:token`
- `GET /api/service-records/:token`
- `POST /api/photo-checks`
- `POST /api/uploads/proof`

## Data Model Pointers

Schema source:

- `src/lib/db/schema.ts`

Important tables:

- `jobs`
- `scope_items`
- `job_photos`
- `photo_checks`
- `approval_links`
- `customer_acknowledgements`
- `job_exceptions`
- `service_records`
- `audit_events`

Server helpers:

- `src/lib/server/jobs.ts`
- `src/lib/server/photos.ts`
- `src/lib/server/approval-links.ts`
- `src/lib/server/tokens.ts`
- `src/lib/ai/photo-check.ts`

## Near-Term Roadmap

Recommended next build order:

1. Make `/ack/:token` fully live-bound for scope and completion, including used/expired/read-only token states.
2. Improve review reel with real photo note/retake/mark-exception actions.
3. Make completion handoff and Service Record generation feel like one smooth app flow.
4. Add IndexedDB/local queue for failed or pending uploads.
5. Add worker auth and business profile.
6. Add operator/business settings.
7. Tighten legal-safe acknowledgement copy after research/legal review.
8. Add tamper-evidence hashes before considering any external ledger/blockchain anchoring.

Do not lead with blockchain in product copy. If ledger/tamper evidence is explored, start with append-only audit events and hash-chained records.

## UX Rules For Future Work

- Mobile app feel first. Desktop can be useful, but not at the expense of mobile field flow.
- No horizontal overflow on mobile.
- Avoid giant marketing hero sections inside the worker app.
- Customer pages can be lighter and record-like; worker capture surfaces should stay dark/camera-like.
- Use real uploaded photos whenever a real job exists. Demo imagery is only fallback.
- QR handoff should always point to a real ScopeNod URL that creates or resolves the current handoff.
- AI is advisory only. It should never block the worker.
- Customer-facing pages must not expose AI confidence, model IDs, raw EXIF/GPS, internal notes, or admin-only audit details.

## Known Local Noise

Old SnapProof PRD draft files may exist locally from the earlier naming phase. They are ignored and should not be treated as ScopeNod source of truth.

Current source of truth:

- `ScopeNod_PRD_final.md`
- `docs/roadmap-notes.md`
- `README.md`
- this `AGENTS.md`
