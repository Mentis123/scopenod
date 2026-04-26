# ScopeNod Roadmap Notes

## Mobile Web First

ScopeNod remains a mobile web app for the V1 pilot. The product should feel like an app inside mobile Safari/Chrome, not like a responsive marketing site.

Native iOS/Android should stay deferred unless field testing proves browser limits are blocking the workflow:

- camera/file picker reliability
- upload resilience
- offline queue reliability
- push notifications
- volume-button capture
- background upload

If those become material pilot blockers, consider a thin native wrapper before committing to full native apps.

## Offline And Upload Resilience

The moodboard promise "works offline, uploads anytime" should become a staged capability:

1. V1: local preview after capture, visible upload status, retry failed uploads.
2. V1.1: IndexedDB queue for pending photos and notes.
3. V1.2: background sync where supported, graceful manual retry where not supported.
4. Later: full offline job drafting if field evidence demands it.

The product should never imply that customer acknowledgement works offline.

## Secure By Design

Security posture for pilot:

- no customer account required
- high-entropy tokenized customer links
- approval tokens are action-limited and single-use
- Service Record links use separate long-lived tokens
- raw originals stay private
- customer pages show display-safe images only
- public pages never expose internal notes, raw EXIF/GPS, AI confidence, or model metadata
- audit events capture important transitions without turning the product into worker surveillance

## Legal And Contract Research

ScopeNod is evidence-adjacent and acknowledgement-adjacent. The product should avoid becoming an accidental legal-contract platform until counsel reviews it.

Research needed before real customer pilot:

- acknowledgement wording
- typed name and checkbox treatment
- whether "contract", "approval", "signature", or "agreement" create obligations we do not want
- ScopeNod's role between business and end customer
- disclaimers that ScopeNod provides recordkeeping software, not legal advice or service guarantees
- liability and indemnity boundaries
- customer photo/privacy consent
- retention and deletion obligations in Australia and target markets

Product language should continue to prefer:

- scope review
- acknowledgement
- Service Record
- starting condition
- completion review

Avoid for now:

- legally binding
- certified
- guaranteed
- waiver
- release
- AI-verified quality

## Ledger / Tamper Evidence

The "ledger" idea is worth exploring, but not as a V1 blockchain dependency.

Recommended sequence:

1. V1: append-only audit events in Postgres.
2. V1.1: hash important artifacts and store hashes on Service Records.
3. V1.2: hash-chain audit events per job for tamper evidence.
4. Later: optionally anchor batched hashes to an external ledger if customers/operators value it.

Do not lead with blockchain in the UX. The customer benefit is a trustworthy record, not crypto infrastructure.

## QR Handoff

QR should be available wherever a customer can review or acknowledge:

- scope review
- completion review
- final Service Record
- exception/context handoff if added later

The QR should point to a ScopeNod URL that resolves the current handoff state, not a static fake code.
