# Waitlist Backend & Database Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist Studafy waitlist signups in Postgres behind a Supabase Edge Function, so the public anon key in the browser bundle can read and write nothing.

**Architecture:** The browser POSTs to an Edge Function. The function checks CORS, hashes the caller IP, calls a rate-limit RPC, screens the honeypot, validates every field, then calls an insert RPC. Both RPCs are `SECURITY DEFINER` with `EXECUTE` granted only to `service_role`. The `waitlist` table has RLS enabled with **zero policies**, which denies every role except `service_role`.

**Tech Stack:** Supabase (Postgres 15, Edge Functions on Deno), Supabase CLI, React 19, Vite 8, Node 18+ for the verification script.

**Spec:** [2026-07-26-waitlist-backend-design.md](../specs/2026-07-26-waitlist-backend-design.md)

## Global Constraints

- **No new npm dependencies.** The verification script uses Node's built-in `fetch` (Node 18+) and a hand-rolled `.env` parser.
- **The service role key never goes in `.env`** and never carries a `VITE_` prefix. Vite inlines every `VITE_*` variable into the public bundle. The verification script reads it from a shell environment variable set per run.
- **The `country` and `frameworks` allow-lists exist in three places** and must stay identical: [src/data/countries.js](../../../src/data/countries.js), [src/data/frameworks.js](../../../src/data/frameworks.js), and the SQL CHECK constraints. The migration carries a comment naming the source files.
- **Frameworks list, verbatim:** `Arabic National`, `IGCSE`, `IB`, `American / SAT`, `French`, `Other`
- **Countries list:** the 56 names in `src/data/countries.js`, copied verbatim in Task 3.
- **Position display formula:** `WAITLIST_POSITION_OFFSET + signup_no`, offset defaults to `186`.
- **Rate limit:** 5 submissions per `ip_hash` per rolling hour; the 6th returns `429`.
- **Error bodies for `500` never contain exception text, SQL, or stack traces.**

## File Structure

| File | Responsibility |
|---|---|
| `.gitignore` (modify) | Keep `.env` and Supabase temp state out of git |
| `.env.example` (modify) | Document required vars + the service-role warning |
| `.env` (create, ignored) | Local frontend config |
| `supabase/config.toml` (create) | CLI project config, function `verify_jwt` |
| `supabase/migrations/20260726090000_waitlist_schema.sql` | Tables, generated column, constraints, indexes |
| `supabase/migrations/20260726090100_waitlist_rls.sql` | RLS enable/force, revokes |
| `supabase/migrations/20260726090200_waitlist_rpcs.sql` | `check_rate_limit`, `submit_waitlist`, grants |
| `supabase/functions/waitlist-submit/index.ts` | HTTP edge: CORS, IP hash, ordering, validation |
| `scripts/verify-security.mjs` | Executable security assertions over HTTPS |
| `src/lib/supabase.js` (rewrite) | Invoke the function; no table access |
| `src/components/sections/WaitlistForm.jsx` (modify) | Real error states instead of fake success |

Migrations are split by concern so a reviewer can reject the RLS design without rejecting the schema.

## Testing Approach — read before Task 1

Every assertion runs over HTTPS against the real Supabase project. No Docker, no local Postgres, no `psql`. This is deliberate: the project is on Windows with no local stack, and the security properties we care about (what the *anon key* can do) are only meaningful against a real deployment.

`scripts/verify-security.mjs` grows across tasks. Each task adds its assertions and runs the whole file, so earlier guarantees are re-checked continuously.

**Running it:**

```powershell
# PowerShell
$env:SUPABASE_SERVICE_ROLE_KEY="<service role key>"; node scripts/verify-security.mjs
```
```bash
# Git Bash
SUPABASE_SERVICE_ROLE_KEY="<service role key>" node scripts/verify-security.mjs
```

**Frontend deviation from strict TDD:** this project has no test runner and the spec's test list contains no frontend unit tests. Tasks 8 and 9 are verified by running the app and by a build-output grep, not by automated tests. Adding Vitest + Testing Library would be a real dependency decision outside this plan's scope. This is called out so the gap is a choice, not an oversight.

---

### Task 1: Secrets hygiene and git initialisation

Nothing else may be committed before this. `.gitignore` currently protects nothing because the project is not a git repository, and the moment `.env` exists it is one `git add .` away from being tracked forever.

**Files:**
- Create: `.gitignore` entries (modify existing file)
- Modify: `.env.example`
- Create: `.env` (must end up ignored)

- [ ] **Step 1: Initialise the repository**

```bash
cd "c:/Users/96277/Desktop/waitlist-app"
git init
```

- [ ] **Step 2: Add the ignore rules**

Append to `.gitignore`:

```gitignore

# Environment — never commit real keys
.env
.env.local
.env.*.local
!.env.example

# Supabase CLI local state
supabase/.temp/
supabase/.branches/
```

- [ ] **Step 3: Rewrite `.env.example`**

Replace the entire contents of `.env.example` with:

```dotenv
# Frontend configuration. Copy to .env and fill in.
#
# Everything here is PUBLIC. Vite inlines every VITE_* variable into the
# JavaScript bundle it ships to browsers. That is fine for these two values:
# the anon key is designed to be public, and Row Level Security denies it
# access to every table.
#
# NEVER put the service role key in this file, and NEVER prefix it with
# VITE_. It bypasses RLS entirely — publishing it hands out full read/write
# access to the database.

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 4: Create `.env` with placeholder values**

Real values arrive in Task 2. For now:

```dotenv
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 5: Verify the ignore actually works**

```bash
git check-ignore -v .env
```
Expected: prints a line naming `.gitignore` and the `.env` rule. If it prints nothing, the rule is wrong — stop and fix before continuing.

```bash
git add -A && git status --short
```
Expected: `.env` does **not** appear. `.env.example` does.

- [ ] **Step 6: Commit**

```bash
git commit -m "chore: init repo, ignore .env, document secret handling"
```

---

### Task 2: Create the Supabase project and link the CLI

Manual account steps. An agent cannot do these — they require the user's Supabase login.

**Files:**
- Create: `supabase/config.toml` (generated by `supabase init`)
- Modify: `.env` (real values)

- [ ] **Step 1: Install the Supabase CLI**

```powershell
npm install -g supabase
supabase --version
```
Expected: a version number. If `npm install -g` is blocked, use `scoop install supabase` or the Windows installer from the Supabase docs.

- [ ] **Step 2: Create the project (user, in browser)**

At https://supabase.com/dashboard → New project. Choose a region near your users. Save the database password somewhere safe — it is shown once.

- [ ] **Step 3: Collect the three keys**

Dashboard → Project Settings → API:
- Project URL → `VITE_SUPABASE_URL`
- `anon` `public` key → `VITE_SUPABASE_ANON_KEY`
- `service_role` `secret` key → **do not put in any file.** Keep it in your password manager.

- [ ] **Step 4: Fill in `.env`**

```dotenv
VITE_SUPABASE_URL=https://<your-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

- [ ] **Step 5: Initialise and link the CLI**

```bash
supabase init
supabase login
supabase link --project-ref <your-ref>
```

- [ ] **Step 6: Confirm `.env` is still ignored**

```bash
git status --short
```
Expected: `.env` absent; `supabase/config.toml` present as a new file.

- [ ] **Step 7: Commit**

```bash
git add supabase/config.toml .gitignore
git commit -m "chore: link supabase project"
```

---

### Task 3: Schema migration

**Files:**
- Create: `supabase/migrations/20260726090000_waitlist_schema.sql`
- Create: `scripts/verify-security.mjs`

**Interfaces:**
- Produces: table `public.waitlist` with columns `id, signup_no, school, school_normalized, country, location, frameworks, phone, name, email, ip_hash, created_at`; table `public.submission_attempts (id, ip_hash, created_at)`; function `public.normalize_school(text) returns text`.

- [ ] **Step 1: Write the failing test**

Create `scripts/verify-security.mjs`:

```js
#!/usr/bin/env node
// Security assertions for the waitlist backend. Runs over HTTPS against the
// live Supabase project — no local database required.
//
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."; node scripts/verify-security.mjs
import { readFileSync } from 'node:fs'

function loadEnv(path) {
  const out = {}
  let raw
  try { raw = readFileSync(path, 'utf8') } catch { return out }
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  return out
}

const env = loadEnv('.env')
const URL_ = env.VITE_SUPABASE_URL
const ANON = env.VITE_SUPABASE_ANON_KEY
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_ || !ANON) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}
if (!SERVICE) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY in your shell (never in .env)')
  process.exit(1)
}

let passed = 0
let failed = 0

async function check(name, fn) {
  try {
    await fn()
    console.log(`  PASS  ${name}`)
    passed++
  } catch (err) {
    console.log(`  FAIL  ${name}`)
    console.log(`        ${err.message}`)
    failed++
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function rest(path, { key, method = 'GET', body, prefer } = {}) {
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  if (body) headers['Content-Type'] = 'application/json'
  if (prefer) headers['Prefer'] = prefer
  return fetch(`${URL_}/rest/v1/${path}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
  })
}

const validRow = () => ({
  school: `Test School ${Date.now()}`,
  country: 'United Arab Emirates',
  location: 'Dubai',
  frameworks: ['IGCSE'],
  phone: '+971500000000',
})

console.log('\n== Schema ==')

await check('service role can insert a valid row', async () => {
  const res = await rest('waitlist', {
    key: SERVICE, method: 'POST', body: validRow(), prefer: 'return=representation',
  })
  assert(res.ok, `expected 2xx, got ${res.status} ${await res.text()}`)
  const [row] = await res.json()
  assert(typeof row.signup_no === 'number', 'signup_no missing')
  assert(row.school_normalized === row.school.toLowerCase(), 'school_normalized not generated')
})

await check('unknown framework is rejected by CHECK constraint', async () => {
  const res = await rest('waitlist', {
    key: SERVICE, method: 'POST', body: { ...validRow(), frameworks: ['Klingon'] },
  })
  assert(!res.ok, 'expected rejection, row was accepted')
})

await check('unknown country is rejected by CHECK constraint', async () => {
  const res = await rest('waitlist', {
    key: SERVICE, method: 'POST', body: { ...validRow(), country: 'Atlantis' },
  })
  assert(!res.ok, 'expected rejection, row was accepted')
})

await check('malformed phone is rejected by CHECK constraint', async () => {
  const res = await rest('waitlist', {
    key: SERVICE, method: 'POST', body: { ...validRow(), phone: '12345' },
  })
  assert(!res.ok, 'expected rejection, row was accepted')
})

await check('duplicate school+country collides regardless of case/spacing', async () => {
  const base = validRow()
  const first = await rest('waitlist', { key: SERVICE, method: 'POST', body: base })
  assert(first.ok, `setup insert failed: ${first.status}`)
  const messy = { ...base, school: `   ${base.school.toUpperCase()}   ` }
  const second = await rest('waitlist', { key: SERVICE, method: 'POST', body: messy })
  assert(second.status === 409, `expected 409 conflict, got ${second.status}`)
})

console.log(`\n${passed} passed, ${failed} failed\n`)
process.exit(failed > 0 ? 1 : 0)
```

- [ ] **Step 2: Run it to verify it fails**

```bash
node scripts/verify-security.mjs
```
Expected: all five checks FAIL — the `waitlist` table does not exist yet, so PostgREST returns 404.

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/20260726090000_waitlist_schema.sql`:

```sql
-- Waitlist storage.
--
-- The country and framework allow-lists below are duplicated from
--   src/data/countries.js  and  src/data/frameworks.js
-- Update all three together.

-- Normalisation is a named IMMUTABLE function so the generated column and the
-- duplicate lookup in submit_waitlist() can never drift apart.
create or replace function public.normalize_school(p_school text)
returns text
language sql
immutable
strict
as $$
  select lower(btrim(regexp_replace(p_school, '\s+', ' ', 'g')))
$$;

create table public.waitlist (
  id                uuid primary key default gen_random_uuid(),
  signup_no         bigint generated always as identity,
  school            text not null,
  school_normalized text generated always as (public.normalize_school(school)) stored,
  country           text not null,
  location          text not null,
  frameworks        text[] not null,
  phone             text not null,
  name              text,
  email             text,
  ip_hash           text,
  created_at        timestamptz not null default now(),

  constraint waitlist_school_len   check (char_length(btrim(school))   between 1 and 200),
  constraint waitlist_location_len check (char_length(btrim(location)) between 1 and 120),
  constraint waitlist_name_len     check (name is null or char_length(name) <= 120),
  constraint waitlist_email_ok     check (
    email is null or (
      char_length(email) <= 254
      and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  ),
  constraint waitlist_phone_e164   check (phone ~ '^\+[1-9][0-9]{5,19}$'),
  constraint waitlist_frameworks_ok check (
    array_length(frameworks, 1) >= 1
    and frameworks <@ array[
      'Arabic National','IGCSE','IB','American / SAT','French','Other'
    ]::text[]
  ),
  constraint waitlist_country_ok check (
    country = any (array[
      'Argentina','Australia','Austria','Bahrain','Bangladesh',
      'Belgium','Brazil','Canada','Chile','China',
      'Colombia','Denmark','Egypt','Finland','France',
      'Germany','Ghana','Greece','India','Indonesia',
      'Ireland','Italy','Japan','Jordan','Kenya',
      'Kuwait','Lebanon','Malaysia','Mexico','Morocco',
      'Netherlands','New Zealand','Nigeria','Norway','Oman',
      'Pakistan','Peru','Philippines','Poland','Portugal',
      'Qatar','Romania','Saudi Arabia','Singapore','South Africa',
      'South Korea','Spain','Sweden','Switzerland','Thailand',
      'Tunisia','Turkey','United Arab Emirates','United Kingdom',
      'United States','Vietnam'
    ]::text[])
  )
);

comment on table  public.waitlist          is 'Studafy waitlist signups. Contains PII.';
comment on column public.waitlist.phone    is 'PII: contact phone number, E.164.';
comment on column public.waitlist.email    is 'PII: optional contact email.';
comment on column public.waitlist.name     is 'PII: optional contact name.';
comment on column public.waitlist.ip_hash  is 'Salted SHA-256 of submitter IP. Not reversible to an IP.';
comment on column public.waitlist.signup_no is 'Stable position source. Displayed as WAITLIST_POSITION_OFFSET + signup_no.';

create unique index waitlist_school_country_uniq
  on public.waitlist (school_normalized, country);

create table public.submission_attempts (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  created_at timestamptz not null default now()
);

comment on table public.submission_attempts is
  'Rate-limit ledger. Salted IP hashes only; pruned to 24h by check_rate_limit().';

create index submission_attempts_ip_time_idx
  on public.submission_attempts (ip_hash, created_at desc);
```

- [ ] **Step 4: Push and re-run the test**

```bash
supabase db push
node scripts/verify-security.mjs
```
Expected: all five schema checks PASS.

If `school_normalized not generated` fails, the `normalize_school` function is not marked `immutable` — Postgres would have rejected the table creation, so check the push output for errors first.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260726090000_waitlist_schema.sql scripts/verify-security.mjs
git commit -m "feat(db): waitlist schema with constraints and dedupe index"
```

---

### Task 4: RLS migration

**Files:**
- Create: `supabase/migrations/20260726090100_waitlist_rls.sql`
- Modify: `scripts/verify-security.mjs`

**Interfaces:**
- Consumes: `public.waitlist`, `public.submission_attempts` from Task 3.
- Produces: both tables unreachable by `anon` and `authenticated`.

- [ ] **Step 1: Write the failing test**

In `scripts/verify-security.mjs`, insert this block immediately **before** the final `console.log` summary lines:

```js
console.log('\n== RLS ==')

await check('anon cannot read waitlist', async () => {
  const res = await rest('waitlist?select=*', { key: ANON })
  assert(!res.ok, `anon got ${res.status}; table is readable`)
})

await check('anon read failure is denial, not an empty table', async () => {
  const res = await rest('waitlist?select=*', { key: ANON })
  if (res.ok) {
    const rows = await res.json()
    throw new Error(`anon read succeeded, returned ${rows.length} rows`)
  }
})

await check('anon cannot insert into waitlist', async () => {
  const res = await rest('waitlist', { key: ANON, method: 'POST', body: validRow() })
  assert(!res.ok, `anon insert returned ${res.status}`)
})

await check('anon cannot read submission_attempts', async () => {
  const res = await rest('submission_attempts?select=*', { key: ANON })
  assert(!res.ok, `anon got ${res.status}`)
})

await check('service role can still read waitlist', async () => {
  const res = await rest('waitlist?select=id&limit=1', { key: SERVICE })
  assert(res.ok, `service role blocked with ${res.status} — RLS is too strict`)
})
```

The second check is not redundant. An empty `[]` with status `200` would mean the table is readable and merely empty — the failure mode that looks like success.

- [ ] **Step 2: Run to verify it fails**

```bash
node scripts/verify-security.mjs
```
Expected: the four `anon cannot ...` checks FAIL. Right now anon *can* reach these tables.

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/20260726090100_waitlist_rls.sql`:

```sql
-- Deny-all posture.
--
-- RLS enabled with ZERO policies denies every role. service_role bypasses RLS
-- by design and is the only writer (via the Edge Function). Adding an
-- "insert-only for anon" policy would be strictly weaker, so none exists.
-- FORCE also subjects the table owner to RLS.

alter table public.waitlist            enable row level security;
alter table public.waitlist            force  row level security;
alter table public.submission_attempts enable row level security;
alter table public.submission_attempts force  row level security;

revoke all on public.waitlist            from anon, authenticated;
revoke all on public.submission_attempts from anon, authenticated;
```

- [ ] **Step 4: Push and re-run**

```bash
supabase db push
node scripts/verify-security.mjs
```
Expected: every check PASSES, including the Task 3 schema checks.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260726090100_waitlist_rls.sql scripts/verify-security.mjs
git commit -m "feat(db): deny-all RLS on waitlist tables"
```

---

### Task 5: Rate-limit and insert RPCs

**Files:**
- Create: `supabase/migrations/20260726090200_waitlist_rpcs.sql`
- Modify: `scripts/verify-security.mjs`

**Interfaces:**
- Consumes: both tables, `public.normalize_school(text)`.
- Produces:
  - `public.check_rate_limit(p_ip_hash text) returns boolean` — records the attempt, then returns `true` if allowed.
  - `public.submit_waitlist(p_school text, p_country text, p_location text, p_frameworks text[], p_phone text, p_name text, p_email text, p_ip_hash text) returns table (status text, signup_no bigint)` where `status` is `'created'` or `'duplicate'`.

- [ ] **Step 1: Write the failing test**

Add before the summary lines in `scripts/verify-security.mjs`:

```js
console.log('\n== RPCs ==')

function rpc(name, args, key) {
  return fetch(`${URL_}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })
}

await check('anon cannot call submit_waitlist', async () => {
  const r = validRow()
  const res = await rpc('submit_waitlist', {
    p_school: r.school, p_country: r.country, p_location: r.location,
    p_frameworks: r.frameworks, p_phone: r.phone,
    p_name: null, p_email: null, p_ip_hash: 'x',
  }, ANON)
  assert(!res.ok, `anon RPC returned ${res.status}`)
})

await check('anon cannot call check_rate_limit', async () => {
  const res = await rpc('check_rate_limit', { p_ip_hash: 'x' }, ANON)
  assert(!res.ok, `anon RPC returned ${res.status}`)
})

await check('submit_waitlist creates then reports duplicate', async () => {
  const r = validRow()
  const args = {
    p_school: r.school, p_country: r.country, p_location: r.location,
    p_frameworks: r.frameworks, p_phone: r.phone,
    p_name: null, p_email: null, p_ip_hash: 'test-hash',
  }
  const first = await rpc('submit_waitlist', args, SERVICE)
  assert(first.ok, `first call failed: ${first.status} ${await first.text()}`)
  const [a] = await first.json()
  assert(a.status === 'created', `expected created, got ${a.status}`)

  const second = await rpc('submit_waitlist',
    { ...args, p_school: `  ${r.school.toUpperCase()}  ` }, SERVICE)
  assert(second.ok, `second call failed: ${second.status} ${await second.text()}`)
  const [b] = await second.json()
  assert(b.status === 'duplicate', `expected duplicate, got ${b.status}`)
  assert(b.signup_no === a.signup_no, `duplicate returned ${b.signup_no}, expected ${a.signup_no}`)
})

await check('check_rate_limit allows 5 then blocks the 6th', async () => {
  const hash = `rl-${Date.now()}`
  for (let i = 1; i <= 5; i++) {
    const res = await rpc('check_rate_limit', { p_ip_hash: hash }, SERVICE)
    assert(res.ok, `call ${i} failed: ${res.status}`)
    assert(await res.json() === true, `call ${i} was blocked, expected allowed`)
  }
  const sixth = await rpc('check_rate_limit', { p_ip_hash: hash }, SERVICE)
  assert(await sixth.json() === false, 'the 6th call was allowed')
})
```

- [ ] **Step 2: Run to verify it fails**

```bash
node scripts/verify-security.mjs
```
Expected: the two `anon cannot call` checks pass trivially (the functions don't exist, so anon gets 404 — a false pass that becomes meaningful once the functions exist). The two behaviour checks FAIL with 404.

- [ ] **Step 3: Write the migration**

Create `supabase/migrations/20260726090200_waitlist_rpcs.sql`:

```sql
-- Records the attempt FIRST, then decides. Ordering matters: the Edge Function
-- calls this before honeypot and validation checks, so malformed and bot
-- traffic consumes quota exactly as fast as valid traffic. Validating first
-- would let an attacker send unlimited junk without ever being throttled.
create or replace function public.check_rate_limit(p_ip_hash text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.submission_attempts (ip_hash) values (p_ip_hash);

  -- Opportunistic pruning keeps the ledger small without a scheduled job.
  delete from public.submission_attempts where created_at < now() - interval '24 hours';

  select count(*) into v_count
    from public.submission_attempts
   where ip_hash = p_ip_hash
     and created_at > now() - interval '1 hour';

  -- The row just inserted is counted, so 5 submissions pass and the 6th fails.
  return v_count <= 5;
end;
$$;

create or replace function public.submit_waitlist(
  p_school     text,
  p_country    text,
  p_location   text,
  p_frameworks text[],
  p_phone      text,
  p_name       text,
  p_email      text,
  p_ip_hash    text
)
returns table (status text, signup_no bigint)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_no bigint;
begin
  insert into public.waitlist (school, country, location, frameworks, phone, name, email, ip_hash)
  values (btrim(p_school), p_country, btrim(p_location), p_frameworks,
          p_phone, nullif(btrim(coalesce(p_name, '')), ''),
          nullif(btrim(coalesce(p_email, '')), ''), p_ip_hash)
  on conflict (school_normalized, country) do nothing
  returning waitlist.signup_no into v_no;

  if v_no is not null then
    return query select 'created'::text, v_no;
  end if;

  select w.signup_no into v_no
    from public.waitlist w
   where w.school_normalized = public.normalize_school(p_school)
     and w.country = p_country;

  return query select 'duplicate'::text, v_no;
end;
$$;

-- Only the Edge Function's service_role may call these.
revoke all on function public.check_rate_limit(text)                             from public, anon, authenticated;
revoke all on function public.submit_waitlist(text,text,text,text[],text,text,text,text) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text)                             to service_role;
grant execute on function public.submit_waitlist(text,text,text,text[],text,text,text,text) to service_role;
```

- [ ] **Step 4: Push and re-run**

```bash
supabase db push
node scripts/verify-security.mjs
```
Expected: all checks PASS. The `anon cannot call` checks are now meaningful — the functions exist and anon is still refused.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260726090200_waitlist_rpcs.sql scripts/verify-security.mjs
git commit -m "feat(db): rate-limit and submit RPCs restricted to service_role"
```

---

### Task 6: Edge Function

**Files:**
- Create: `supabase/functions/waitlist-submit/index.ts`
- Modify: `supabase/config.toml`

**Interfaces:**
- Consumes: `check_rate_limit`, `submit_waitlist` RPCs via PostgREST with the service role key.
- Produces: `POST /functions/v1/waitlist-submit` returning `200 { position, duplicate }`, `400 { error, fields }`, `429 { error }`, `500 { error }`.

The function calls PostgREST with plain `fetch` rather than the Supabase JS SDK. One less dependency to pin, one less thing to break on a runtime upgrade, and the two calls are trivial HTTP.

- [ ] **Step 1: Write the function**

Create `supabase/functions/waitlist-submit/index.ts`:

```ts
// Waitlist submission endpoint.
//
// Order is deliberate: CORS -> IP hash -> rate limit (records the attempt)
// -> honeypot -> validation -> insert. Rate limiting precedes validation so
// junk payloads consume quota too.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const IP_HASH_SALT = Deno.env.get('IP_HASH_SALT')!
const ALLOWED_ORIGINS = (Deno.env.get('ALLOWED_ORIGINS') ?? '')
  .split(',').map((o) => o.trim()).filter(Boolean)
const POSITION_OFFSET = Number(Deno.env.get('WAITLIST_POSITION_OFFSET') ?? '186')

const FRAMEWORKS = ['Arabic National', 'IGCSE', 'IB', 'American / SAT', 'French', 'Other']

const COUNTRIES = [
  'Argentina','Australia','Austria','Bahrain','Bangladesh',
  'Belgium','Brazil','Canada','Chile','China',
  'Colombia','Denmark','Egypt','Finland','France',
  'Germany','Ghana','Greece','India','Indonesia',
  'Ireland','Italy','Japan','Jordan','Kenya',
  'Kuwait','Lebanon','Malaysia','Mexico','Morocco',
  'Netherlands','New Zealand','Nigeria','Norway','Oman',
  'Pakistan','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Saudi Arabia','Singapore','South Africa',
  'South Korea','Spain','Sweden','Switzerland','Thailand',
  'Tunisia','Turkey','United Arab Emirates','United Kingdom',
  'United States','Vietnam',
]

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {}
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  }
}

function json(body: unknown, status: number, cors: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function sha256(input: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0')).join('')
}

function rpc(name: string, args: unknown) {
  return fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
}

type Fields = Record<string, string>

function validate(b: Record<string, unknown>): { fields: Fields; clean?: Record<string, unknown> } {
  const fields: Fields = {}
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  const school = str(b.school)
  if (!school) fields.school = 'Add the school name.'
  else if (school.length > 200) fields.school = 'School name is too long.'

  const country = str(b.country)
  if (!country) fields.country = 'Choose a country from the list.'
  else if (!COUNTRIES.includes(country)) fields.country = 'Choose a country from the list.'

  const location = str(b.location)
  if (!location) fields.location = 'Add a city or area.'
  else if (location.length > 120) fields.location = 'Location is too long.'

  const frameworks = Array.isArray(b.frameworks) ? b.frameworks.map(str) : []
  if (!frameworks.length) fields.fw = 'Pick at least one framework.'
  else if (!frameworks.every((f) => FRAMEWORKS.includes(f))) fields.fw = 'Unknown framework selected.'

  const phone = str(b.phone).replace(/[\s()-]/g, '')
  if (!/^\+[1-9][0-9]{5,19}$/.test(phone)) fields.phone = 'Add a valid phone number.'

  const name = str(b.name)
  if (name.length > 120) fields.name = 'Name is too long.'

  const email = str(b.email)
  if (email && (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))) {
    fields.email = 'That email address looks wrong.'
  }

  if (Object.keys(fields).length) return { fields }
  return {
    fields,
    clean: {
      p_school: school, p_country: country, p_location: location,
      p_frameworks: frameworks, p_phone: phone,
      p_name: name || null, p_email: email || null,
    },
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin')
  const cors = corsHeaders(origin)

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405, cors)

  try {
    let body: Record<string, unknown>
    try {
      body = await req.json()
    } catch {
      return json({ error: 'Invalid request.', fields: {} }, 400, cors)
    }

    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown'
    const ipHash = await sha256(ip + IP_HASH_SALT)

    const rl = await rpc('check_rate_limit', { p_ip_hash: ipHash })
    if (!rl.ok) throw new Error(`rate limit rpc failed: ${rl.status} ${await rl.text()}`)
    if ((await rl.json()) !== true) {
      return json({ error: 'Too many submissions. Please try again shortly.' }, 429, cors)
    }

    // Honeypot: a filled hidden field means a bot. Return a plausible success so
    // it does not retry, and write nothing.
    if (typeof body.company_website === 'string' && body.company_website.trim() !== '') {
      return json({ position: POSITION_OFFSET + 1, duplicate: false }, 200, cors)
    }

    const { fields, clean } = validate(body)
    if (!clean) return json({ error: 'Check the highlighted fields.', fields }, 400, cors)

    const res = await rpc('submit_waitlist', { ...clean, p_ip_hash: ipHash })
    if (!res.ok) throw new Error(`submit rpc failed: ${res.status} ${await res.text()}`)

    const [row] = await res.json()
    return json({
      position: POSITION_OFFSET + Number(row.signup_no),
      duplicate: row.status === 'duplicate',
    }, 200, cors)
  } catch (err) {
    // Details go to function logs only — never to the client.
    console.error('waitlist-submit failed:', err)
    return json({ error: 'Something went wrong. Please try again.' }, 500, cors)
  }
})
```

- [ ] **Step 2: Pin `verify_jwt` explicitly**

Append to `supabase/config.toml`:

```toml
[functions.waitlist-submit]
verify_jwt = true
```

This is the default, but stating it prevents a future config change from silently opening the endpoint. It is a speed bump, not a security boundary — the anon key is public. The rate limit is the real control.

- [ ] **Step 3: Set the secrets**

Generate a salt:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```bash
supabase secrets set IP_HASH_SALT="<the generated hex>"
supabase secrets set ALLOWED_ORIGINS="http://localhost:5173,https://your-production-domain.com"
supabase secrets set WAITLIST_POSITION_OFFSET="186"
```

Do **not** set `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` — the platform injects those and rejects them as user secrets.

- [ ] **Step 4: Deploy**

```bash
supabase functions deploy waitlist-submit
```

- [ ] **Step 5: Add endpoint tests**

Add before the summary lines in `scripts/verify-security.mjs`:

```js
console.log('\n== Edge Function ==')

const FN = `${URL_}/functions/v1/waitlist-submit`
const ORIGIN = 'http://localhost:5173'

function callFn(body, { origin = ORIGIN } = {}) {
  return fetch(FN, {
    method: 'POST',
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      'Content-Type': 'application/json',
      Origin: origin,
    },
    body: JSON.stringify(body),
  })
}

await check('valid submission returns a position', async () => {
  const res = await callFn(validRow())
  assert(res.ok, `got ${res.status} ${await res.text()}`)
  const out = await res.json()
  assert(typeof out.position === 'number', 'no position returned')
  assert(out.duplicate === false, 'fresh school reported as duplicate')
})

await check('repeat submission returns duplicate with the same position', async () => {
  const r = validRow()
  const a = await (await callFn(r)).json()
  const b = await (await callFn({ ...r, school: `  ${r.school.toUpperCase()}  ` })).json()
  assert(b.duplicate === true, 'second submission not flagged duplicate')
  assert(b.position === a.position, `position changed: ${a.position} -> ${b.position}`)
})

await check('unknown framework returns 400 with field errors', async () => {
  const res = await callFn({ ...validRow(), frameworks: ['Klingon'] })
  assert(res.status === 400, `expected 400, got ${res.status}`)
  const out = await res.json()
  assert(out.fields && out.fields.fw, 'no field-level error returned')
})

await check('honeypot returns 200 and writes nothing', async () => {
  const r = { ...validRow(), company_website: 'spam' }
  const res = await callFn(r)
  assert(res.ok, `expected 200, got ${res.status}`)
  const check_ = await rest(
    `waitlist?select=id&school=eq.${encodeURIComponent(r.school)}`, { key: SERVICE })
  const rows = await check_.json()
  assert(rows.length === 0, 'honeypot submission was written to the table')
})

await check('disallowed origin gets no CORS header', async () => {
  const res = await callFn(validRow(), { origin: 'https://evil.example' })
  assert(!res.headers.get('access-control-allow-origin'),
    'allow-origin header sent to a disallowed origin')
})

await check('invalid payloads consume rate-limit quota too', async () => {
  // The point of checking the rate limit BEFORE validation: an attacker must
  // not get unlimited requests just by making them malformed. Every call here
  // is a guaranteed 400 — if quota is only spent on valid submissions, we
  // never reach 429 and this fails.
  let sawLimit = false
  for (let i = 0; i < 10; i++) {
    const res = await callFn({ ...validRow(), frameworks: ['Klingon'] })
    if (res.status === 429) { sawLimit = true; break }
    assert(res.status === 400, `expected 400 or 429, got ${res.status}`)
  }
  assert(sawLimit, 'ten invalid payloads never triggered 429 — validation is running before the rate limit')
})
```

- [ ] **Step 6: Run the tests**

```bash
node scripts/verify-security.mjs
```
Expected: all PASS.

Note the ordering hazard: the rate-limit check burns the quota for your IP for an hour. Run it last, or wait an hour between full runs. If earlier Edge Function checks start failing with `429`, that is why — not a regression.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions supabase/config.toml scripts/verify-security.mjs
git commit -m "feat(api): waitlist-submit edge function with rate limiting"
```

---

### Task 7: Frontend client layer

**Files:**
- Modify: `src/lib/supabase.js` (full rewrite)

**Interfaces:**
- Consumes: the `waitlist-submit` endpoint.
- Produces: `submitWaitlist(entry) -> Promise<{ position: number, duplicate: boolean }>`, throwing `WaitlistError` with `.status` and `.fields` on failure. Also exports `isSupabaseConfigured: boolean`.

- [ ] **Step 1: Rewrite the file**

Replace the entire contents of `src/lib/supabase.js`:

```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export class WaitlistError extends Error {
  constructor(message, { status = 0, fields = {} } = {}) {
    super(message)
    this.name = 'WaitlistError'
    this.status = status
    this.fields = fields
  }
}

/**
 * Submit a waitlist entry.
 *
 * The browser never touches the database — RLS denies the anon key everything.
 * The Edge Function owns validation, deduplication and the position number.
 */
export async function submitWaitlist(entry) {
  // Local development without a Supabase project still works. This fires only
  // when the env vars are missing, never on a network or server error, so a
  // real failure can never masquerade as success.
  if (!isSupabaseConfigured) {
    console.warn('[studafy] Supabase not configured — returning stub position')
    return { position: 187, duplicate: false }
  }

  const { data, error } = await supabase.functions.invoke('waitlist-submit', {
    body: {
      school: entry.school,
      country: entry.country,
      location: entry.location,
      frameworks: entry.frameworks,
      phone: entry.phone,
      name: entry.name || null,
      email: entry.email || null,
      company_website: entry.honeypot || '',
    },
  })

  if (error) {
    // functions.invoke wraps non-2xx responses in a FunctionsHttpError and puts
    // the original Response on error.context — the JSON body is not on `error`.
    const status = error.context?.status ?? 0
    let body = {}
    try { body = await error.context.json() } catch { /* non-JSON error body */ }

    throw new WaitlistError(
      body.error || 'Something went wrong. Please try again.',
      { status, fields: body.fields || {} },
    )
  }

  return { position: data.position, duplicate: Boolean(data.duplicate) }
}
```

- [ ] **Step 2: Verify the leak is gone**

```bash
grep -n "count" src/lib/supabase.js
```
Expected: no output. The `select('*', { count: 'exact' })` query that required anon read access is gone.

- [ ] **Step 3: Commit**

```bash
git add src/lib/supabase.js
git commit -m "feat(web): call edge function, drop client-side table access"
```

---

### Task 8: Form error handling

Fixes the two defects from the spec: fabricated success on failure, and the permanently stuck submit button.

**Files:**
- Modify: `src/components/sections/WaitlistForm.jsx`

**Interfaces:**
- Consumes: `submitWaitlist`, `WaitlistError` from Task 7.

- [ ] **Step 1: Update the import**

Line 3 becomes:

```jsx
import { submitWaitlist, WaitlistError } from '../../lib/supabase'
```

- [ ] **Step 2: Add a form-level error state**

After line 24 (`const [liveMsg, setLiveMsg] = useState('')`), add:

```jsx
const [formError, setFormError] = useState('')
```

- [ ] **Step 3: Replace the submit handler body**

Replace lines 55-74 (from `if (honeypot) return` through the closing `}` of `handleSubmit`) with:

```jsx
    setSending(true)
    setFormError('')

    try {
      const res = await submitWaitlist({
        school: school.trim(),
        country: country[0],
        location: location.trim(),
        frameworks,
        phone: (country ? country[1] : '') + phone.replace(/^0+/, ''),
        name: name.trim(),
        email: email.trim(),
        honeypot,
      })
      setTimeout(() => setDone({ school: school.trim(), position: res.position }), 900)
    } catch (err) {
      setSending(false)

      if (err instanceof WaitlistError && err.status === 429) {
        setFormError('That was a lot of submissions at once. Please try again in a few minutes.')
      } else if (err instanceof WaitlistError && err.status === 400) {
        setErrors(prev => ({ ...prev, ...err.fields }))
        setFormError('Check the highlighted fields.')
      } else {
        console.error('[studafy] waitlist submit failed:', err)
        setFormError("We couldn't save your details. Please check your connection and try again.")
      }
    }
```

Two changes worth understanding rather than copying blindly:

- The honeypot is no longer a silent client-side `return`. It travels to the server as `company_website`, so bots are counted and handled server-side. The old early return told us nothing.
- `setSending(false)` now runs on every failure path. Previously it ran on none, so one failed submit disabled the button until a page reload.

- [ ] **Step 4: Render the error**

Replace line 166 (`<p ... aria-live="polite">{liveMsg}</p>`) with:

```jsx
      {formError && (
        <p role="alert" className="text-[13px] leading-[1.5] text-err m-0">{formError}</p>
      )}
      <p className="text-[13px] leading-[1.5] text-muted m-0" aria-live="polite">{liveMsg}</p>
```

`role="alert"` makes screen readers announce the failure immediately, matching how the field errors already behave.

- [ ] **Step 5: Verify by hand**

```bash
npm run dev
```

1. Submit a valid form → success screen with a real position.
2. Submit the same school again → success screen, same position, no error.
3. Stop your network connection, submit → red error message, button returns to "Join the waitlist", and it is clickable again.
4. Reconnect and retry → succeeds.

Check the Supabase dashboard → Table Editor → `waitlist` and confirm the rows are actually there.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/WaitlistForm.jsx
git commit -m "fix(web): surface submit failures instead of faking success"
```

---

### Task 9: Final verification

**Files:**
- None modified.

- [ ] **Step 1: Confirm no secret reached the bundle**

```bash
npm run build
grep -ri "service_role" dist/ ; grep -rF "$SUPABASE_SERVICE_ROLE_KEY" dist/
```
Expected: no output from either. Any hit is a release-blocking leak.

- [ ] **Step 2: Confirm `.env` is not tracked**

```bash
git ls-files | grep -E "^\.env$"
```
Expected: no output. If `.env` appears, it is in git history — rotate the keys in the Supabase dashboard and remove the file from history before pushing anywhere.

- [ ] **Step 3: Full security suite**

Wait an hour since the last run so the rate-limit quota has reset, then:

```bash
node scripts/verify-security.mjs
```
Expected: every check PASSES, zero failures, exit code 0.

- [ ] **Step 4: Set the production origin**

Once the site has a real domain:

```bash
supabase secrets set ALLOWED_ORIGINS="https://your-production-domain.com"
supabase functions deploy waitlist-submit
```

Dropping `http://localhost:5173` in production is intentional — a permanently allowed localhost origin lets any locally-running page call your endpoint.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: waitlist backend verified end to end"
```

---

## Notes for the implementer

- **Task 2 requires a human.** Creating a Supabase account and project cannot be automated. Stop and hand back if you reach it without credentials.
- **The rate limiter will bite you during development.** Six test submissions from your own IP within an hour and you are locked out. Either wait, or temporarily raise the limit in `check_rate_limit` and lower it before finishing.
- **`supabase db push` is not reversible.** Review each migration before pushing. There is no down-migration in this plan because the project has no data worth preserving yet — that changes the moment real schools sign up.
