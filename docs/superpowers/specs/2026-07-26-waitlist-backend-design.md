# Waitlist Backend & Database — Design

**Date:** 2026-07-26
**Status:** Approved
**Scope:** Persistence, backend endpoint, secrets handling, and security posture for the Studafy waitlist form.

---

## 1. Problem

The frontend ([src/components/sections/WaitlistForm.jsx](../../../src/components/sections/WaitlistForm.jsx)) collects waitlist
signups but has nowhere to put them. [src/lib/supabase.js](../../../src/lib/supabase.js) assumes a `waitlist` table that does
not exist, and falls back to a stub when it is missing. No Supabase project exists yet, there is no `.env`, and `.gitignore`
has no env rule.

Two defects in the current code must be fixed as part of this work:

1. **Silent data loss.** `WaitlistForm.jsx` catches every submission error and shows the user a fake success screen with
   position `187`. A school believes it joined the waitlist; no record exists; nobody is alerted.
2. **PII exposure by design.** `submitWaitlist` reads the position via `select('*', { count: 'exact' })`. For that to work
   under RLS, the anon role would need `SELECT` on `waitlist` — and the anon key ships inside the public JS bundle. Anyone
   could then read every school's phone number. The position must not come from a client-side query.

## 2. Decisions

| Question | Decision | Rationale |
|---|---|---|
| Where does write logic run? | Supabase Edge Function | Serverless, no hosting to own, and lets RLS deny the public anon key *all* table access. |
| Encryption depth | Platform default (AES-256 at rest, TLS in transit) + strict access control | No key management, no risk of locking ourselves out of our own leads. Access control is the real defense. |
| Schema application | Fresh project, CLI migrations under `supabase/` | Schema versioned in git; migration file is also paste-able into the SQL Editor. |
| Duplicate handling | Unique on (normalized school, country) | Treats the school as the entity, so two staff from one school don't create two rows. |
| Abuse protection | IP rate limit in the database | No third party, no cost, no user friction. Raw IPs are never stored. |

### Accepted risk

School names are free text, so `(school_normalized, country)` uniqueness can produce false collisions
("Northgate Academy" vs "Northgate Academy Dubai" are distinct; "St. Mary's" vs "St Marys" are not). Mitigated by
normalizing (lowercase, collapse internal whitespace, trim) before comparison. Not mitigated: genuinely different
spellings of the same school, or two distinct schools sharing a name within one country. A duplicate returns the
existing position rather than an error, so the worst case is a second school seeing the first school's position number
instead of its own row being created. Revisit if it shows up in real data.

## 3. Architecture

```
Browser (React)
  |  POST { school, country, location, frameworks, phone, name?, email?, company_website }
  v
Edge Function  waitlist-submit   (Deno, service_role, secrets held by Supabase)
  |  1. CORS origin allowlist
  |  2. sha256(ip + IP_HASH_SALT) -> ip_hash
  |  3. check_rate_limit(ip_hash) RPC  -- records the attempt, then decides
  |        not allowed -> 429, stop
  |  4. honeypot check -> fake 200, stop
  |  5. server-side validation (client input is never trusted)
  |        invalid -> 400, stop
  v
Postgres RPC  submit_waitlist()  (SECURITY DEFINER, EXECUTE granted to service_role only)
  |  - INSERT .. ON CONFLICT (school_normalized, country) -> 'duplicate'
  v
returns { status, position }
```

**Ordering matters.** The rate limit is checked and recorded *before* honeypot and validation, so a flood of
deliberately-invalid payloads still consumes the attacker's quota. Placing validation first would let an attacker send
unlimited malformed requests without ever being throttled.

The browser never touches the `waitlist` table. The anon key embedded in the bundle can read nothing, write nothing, and
call no RPC. Its only remaining capability is invoking the Edge Function, which is rate-limited.

### Component responsibilities

| Unit | Does | Depends on |
|---|---|---|
| `check_rate_limit()` RPC | Record the attempt, then report whether this `ip_hash` is over quota. Also prunes rows older than 24h. | `submission_attempts` |
| `submit_waitlist()` RPC | Insert-or-detect-duplicate, return position. Atomic. | `waitlist` |
| `waitlist-submit` Edge Function | CORS, IP hashing, ordering of the two RPCs, honeypot, validation, HTTP status mapping. Holds all secrets. | Both RPCs via service role |
| `src/lib/supabase.js` | Invokes the function, surfaces typed results. Contains no table access. | Edge Function |
| `WaitlistForm.jsx` | UI state, client-side validation for fast feedback, error display. | `submitWaitlist` |

## 4. Database schema

```sql
create table public.waitlist (
  id                uuid primary key default gen_random_uuid(),
  signup_no         bigint generated always as identity,
  school            text not null,
  school_normalized text generated always as
                      (lower(btrim(regexp_replace(school, '\s+', ' ', 'g')))) stored,
  country           text not null,
  location          text not null,
  frameworks        text[] not null,
  phone             text not null,   -- E.164, normalized server-side
  name              text,
  email             text,
  ip_hash           text,            -- provenance; raw IPs are never stored
  created_at        timestamptz not null default now()
);

create unique index waitlist_school_country_uniq
  on public.waitlist (school_normalized, country);

create table public.submission_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);
create index submission_attempts_ip_time_idx
  on public.submission_attempts (ip_hash, created_at desc);
```

### Constraints

Enforced in the database so they hold regardless of which client writes:

- `school`, `location` — length 1..200 and 1..120 after trim
- `country` — must be a member of the countries list in [src/data/countries.js](../../../src/data/countries.js)
- `frameworks` — non-empty, and every element ∈ `{Arabic National, IGCSE, IB, American / SAT, French, Other}`
- `phone` — matches `^\+[1-9][0-9]{5,19}$`
- `email` — null, or matches a basic address pattern, max 254 chars
- `name` — null or max 120 chars

The framework and country lists exist in two places (JS data files and SQL constraints). The migration carries a comment
pointing at the source files so a future edit updates both.

### Position semantics

`signup_no` is a real identity sequence, so a position is stable for the lifetime of the row. The displayed number is
`WAITLIST_POSITION_OFFSET + signup_no`, with the offset held as an Edge Function secret defaulting to `186` — signup #1
displays as `#187`, matching the existing UI copy. Setting it to `0` shows true counts. This makes the currently
hardcoded `INITIAL_WAITLIST_COUNT = 187` an explicit, changeable decision rather than a constant buried in a component.

### PII

`phone`, `email`, and `name` carry `COMMENT ON COLUMN` markers identifying them as PII, so the classification is visible
to anyone reading the schema.

## 5. Row Level Security

```sql
alter table public.waitlist            enable row level security;
alter table public.waitlist            force  row level security;
alter table public.submission_attempts enable row level security;
alter table public.submission_attempts force  row level security;

revoke all on public.waitlist, public.submission_attempts from anon, authenticated;
revoke all on function public.submit_waitlist(...) from anon, authenticated, public;
grant execute on function public.submit_waitlist(...) to service_role;
```

**Zero policies is deliberate.** RLS enabled with no policy denies everything for every role except `service_role`, which
bypasses RLS by design and is what the Edge Function uses. An "insert-only for anon" policy would be strictly weaker, so
none is added. `force` ensures the table owner is subject to RLS too.

Reading the waitlist happens through the Supabase dashboard (service role) or a future authenticated admin surface. That
admin surface is explicitly out of scope here.

## 6. Encryption

- **At rest:** AES-256, provided by Supabase for the whole database volume.
- **In transit:** TLS 1.2+ for browser to Edge Function, and for Edge Function to Postgres.
- **Application layer:** none. Per the decision above, access control is the defense. No encryption keys to manage and no
  way to render our own leads unreadable.

Trade-off recorded honestly: a stolen database dump *would* contain readable phone numbers. Preventing that requires
app-level encryption with a key held outside the database, which was considered and declined for key-management cost.

## 7. Secrets and environment

### `.env` — new, gitignored, frontend only

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

Everything in this file is public by definition: Vite inlines every `VITE_*` variable into the shipped JS bundle. The
anon key is designed to be public and is safe there *because* RLS denies it everything.

### Edge Function secrets — `supabase secrets set`, never in any file

| Secret | Purpose | Default |
|---|---|---|
| `IP_HASH_SALT` | Salt for the IP hash | none — generate random, required |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowlist | none — required |
| `WAITLIST_POSITION_OFFSET` | Display offset for position | `186` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform automatically and must not be set manually.

### `.gitignore` additions

```
.env
.env.local
.env.*.local
!.env.example
supabase/.temp/
```

### Hard rule

**The service role key must never carry a `VITE_` prefix, and must never appear in `.env`.** It bypasses RLS entirely;
a `VITE_` prefix would inline it into the public bundle and hand out full database access. This is stated as a comment
in `.env.example`.

**Note:** this project is not yet a git repository, so `.gitignore` protects nothing until `git init` is run. That must
happen before the first commit, and `.env` must never be added to the index.

## 8. Edge Function contract

`POST /functions/v1/waitlist-submit`

Request body:

```json
{
  "school": "string", "country": "string", "location": "string",
  "frameworks": ["string"], "phone": "string",
  "name": "string|null", "email": "string|null",
  "company_website": "string"
}
```

`company_website` is the honeypot. A non-empty value returns `200` with a plausible fabricated position — the bot sees
success and does not retry; nothing is written.

Responses:

| Status | Body | When |
|---|---|---|
| `200` | `{ position: number, duplicate: boolean }` | Created, or matched an existing school |
| `400` | `{ error: string, fields: { [field]: string } }` | Validation failure |
| `429` | `{ error: string }` | More than 5 submissions from one IP hash in one hour |
| `500` | `{ error: "Something went wrong. Please try again." }` | Anything else |

`500` bodies never include exception text, SQL, or stack traces. Details go to function logs only.

CORS: the `Origin` header is checked against `ALLOWED_ORIGINS`; matching origins are echoed in
`Access-Control-Allow-Origin`. Non-matching origins get no CORS headers. `OPTIONS` preflight is handled.

`verify_jwt` stays enabled (the default). The client already sends the anon key, so this costs nothing and blocks the
laziest unauthenticated `curl`. It is a speed bump, not a security boundary — the rate limit is the real control.

### Rate limiting

`ip_hash = sha256(<client ip> || IP_HASH_SALT)`, client IP taken from the leftmost `x-forwarded-for` entry. The
`check_rate_limit` RPC inserts the attempt first, then counts rows for that hash within the last hour and reports not-allowed
above 5. Because recording precedes honeypot and validation checks (see §3), invalid and bot payloads consume quota too — a
flood cannot be extended by making the requests malformed. Rows older than 24 hours are deleted opportunistically on each
call, keeping the table small without a scheduled job.

Salting means the table holds no reversible IP addresses.

## 9. Frontend changes

**[src/lib/supabase.js](../../../src/lib/supabase.js)**

- `submitWaitlist` calls `supabase.functions.invoke('waitlist-submit', { body })`.
- The `count` query is deleted — it is the PII leak identified in §1.
- Returns `{ position, duplicate }` on success; throws a typed error carrying `status` and `fields` otherwise.
- The stub fallback is kept **only** when `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are absent, so local development
  without a Supabase project still works. It never triggers on a network or server error.

**[src/components/sections/WaitlistForm.jsx](../../../src/components/sections/WaitlistForm.jsx)**

- Lines 70-73: the catch-all that fabricates success is replaced by a real inline error message with retry. Failures are
  visible to the user instead of silently discarded.
- Line 57: `setSending(true)` is currently never reversed on the error path, leaving the button stuck on "Adding your
  school" forever. `setSending(false)` is added to the failure branch.
- `400` responses map their `fields` object onto the existing per-field `errors` state, so server validation surfaces in
  the same UI as client validation.
- `429` shows a distinct, non-alarming message asking the user to try again shortly.
- `duplicate: true` renders the normal `SuccessState` with the school's original position. A double-click must never
  produce an error screen.

## 10. Testing

Verification is primarily security assertions, run against a real project:

1. **Anon cannot read.** `curl` `/rest/v1/waitlist?select=*` with the anon key — must fail, not return `[]`. An empty
   array would mean the table is readable and merely empty.
2. **Anon cannot write.** Same with `POST` — must fail.
3. **Anon cannot call the RPC.** `POST /rest/v1/rpc/submit_waitlist` with the anon key — must fail.
4. **Happy path.** Valid submission returns `200` and a position; the row is present via service role.
5. **Duplicate.** `"  northgate   academy "` after `"Northgate Academy"` in the same country returns
   `duplicate: true` with the first position, and creates no second row.
6. **Rate limit.** The 6th submission within an hour from one IP returns `429`, and 6 *invalid* payloads exhaust the
   quota just as fast as 6 valid ones.
7. **Honeypot.** A payload with a non-empty `company_website` returns `200` and creates no row.
8. **Constraint enforcement.** A payload with an unknown framework, an unknown country, or a malformed phone is rejected
   with `400` — and rejected by the database even if the function's validation is bypassed.
9. **CORS.** A request from an origin outside `ALLOWED_ORIGINS` receives no allow-origin header.
10. **No secret leakage.** `npm run build` then grep `dist/` for the service role key and for `service_role` — zero hits.

## 11. Out of scope

- Admin UI for viewing or exporting the waitlist (dashboard is sufficient for now)
- Confirmation emails to the optional email address
- Analytics on signups
- Migrating the existing hardcoded `187` to a real seeded row count
