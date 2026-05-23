# STACK.md — Technology Decisions for RenTell

All decisions below are **locked** for this project. Do not re-debate them mid-sprint.
To change a decision, add an entry to `DECISIONS.md` with a rationale and get team agreement first.

ERD source: `ERD/Rentell Physical ERD (3).json` — read before any schema work.

---

## Stack at a Glance

| Layer | Choice |
|-------|--------|
| Frontend framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Language | TypeScript |
| DB engine | PostgreSQL |
| DB host | Neon (serverless managed Postgres) |
| SQL driver | `postgres` (postgres.js by porsager) |
| Auth | bcrypt + server-side sessions (DB-backed `Session` table) |
| Input validation | Zod |
| Package manager | npm |
| File storage | None — v1 non-goal (no image columns in ERD) |

---

## Detailed Rationale

### Frontend — Next.js 14 (App Router)

**Rationale:** One framework covers the full stack — React UI + server route handlers/server actions where we write raw SQL directly. No separate API server to wire up or coordinate across a 5-person repo.

> Ties to CMSC 127 goal: SQL queries live in server actions, right next to the UI that uses them — easy to trace data flow for grading and for learning.

**Debatable:** A Vite + React SPA + separate Hono/Express API would produce cleaner front/back separation. Tradeoff: two servers to deploy, more config, more CORS wiring — a poor fit for a 5-day sprint with mixed experience levels.

---

### Styling — Tailwind CSS + shadcn/ui

**Rationale:** shadcn/ui provides polished, accessible, copy-owned components (tables, dialogs, badges, cards) out of the box — directly serves the "highly polished UI" requirement without building from scratch. Tailwind keeps all styling co-located and fast to iterate on.

> Ties to UI goal: directory listings, review cards, and filter sidebars look production-quality with minimal design effort.

**Not debatable for this use case.** Bootstrap or plain CSS would require significantly more time for the same visual result.

---

### Language — TypeScript

**Rationale:** Catches type mismatches at compile time, especially valuable in a 5-person team where not everyone will read each other's code closely. Next.js and shadcn/ui are TypeScript-native.

---

### Database Engine — PostgreSQL

**Rationale:** First-class `CHECK` constraints, triggers, partial indexes, and `RETURNING` clauses — the best engine for demonstrating DB-level enforcement that CMSC 127 rewards. The XOR check on `Review`/`Favorite` (exactly one of `housing_id`/`carinderia_id` populated) and the `CHECK (rating BETWEEN 1 AND 5)` are natively clean in Postgres.

> Ties to CMSC 127 goal: constraint-rich DDL is visible, teachable, and gradeable.

**Debatable:** MySQL 8 supports `CHECK` and triggers in 8.0+, but weaker tooling and historically lenient enforcement. **Flag:** Some CMSC 127 sections mandate MySQL — confirm with your instructor before the DB setup phase. If MySQL is required, document the switch in `DECISIONS.md`.

---

### DB Host — Neon (serverless managed Postgres)

**Rationale:** Zero local setup. One shared `DATABASE_URL` string in a `.env.local` file gives all 5 team members access to the same live database instantly — no Docker, no local Postgres install, no "it works on my machine" issues. Generous free tier. Pure Postgres dialect: every raw SQL statement you write locally runs identically on Neon.

> Ties to CMSC 127 goal: the team runs DDL (`CREATE TABLE`, `ALTER TABLE`) and DML directly — Neon doesn't abstract anything.

**Debatable:** Supabase offers a built-in Studio GUI (friendlier for non-technical members to browse tables and run SQL). Tradeoff: Supabase bundles auth/storage we aren't using, and its client SDK nudges teams toward its abstractions. Neon + a free desktop GUI (DBeaver or TablePlus) achieves the same visual browsing without the abstraction risk.

**Recommended GUI client:** Install [DBeaver Community](https://dbeaver.io/) (free, cross-platform) and connect with the shared `DATABASE_URL`. All 5 members should do this — it's the team's shared view of the live schema.

---

### SQL Driver — `postgres` (postgres.js by porsager)

**Rationale:** Tagged-template literal syntax auto-parameterizes queries (safe against SQL injection) while reading exactly like SQL:

```ts
const housing = await sql`
  SELECT * FROM housing
  WHERE housing_type = ${type}
  ORDER BY proximity_to_campus_km ASC
`
```

No ORM layer, no query builder — the team writes and reads real SQL. Result rows are plain objects.

> Ties to CMSC 127 goal: every query is visible, auditable, and directly maps to what the team learns in lecture.

**Install:** `npm install postgres`

**Debatable:**
- `node-postgres` (`pg`) is the older standard but requires manual pool config and `pg.query()` string interpolation is less readable.
- `Drizzle ORM` offers type-safe results with a raw SQL escape hatch, but the ORM layer adds a learning curve the course doesn't reward.
- `Prisma` is too much abstraction — avoid.

---

### Auth — bcrypt + DB-backed sessions

**Context:** The ERD's `Student` entity has no credential field. Auth requires a **documented schema extension** (see `DECISIONS.md`).

**Schema additions (not in ERD — documented deviations):**

```sql
-- Added to Student table
password_hash  VARCHAR(255) NOT NULL

-- New table (not in ERD)
CREATE TABLE session (
  session_id   VARCHAR(64)  PRIMARY KEY,
  student_number VARCHAR(15) NOT NULL REFERENCES student(student_number) ON DELETE CASCADE,
  expires_at   TIMESTAMPTZ  NOT NULL,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

**Rationale:** All auth data lives in our own Postgres schema — the team can `SELECT * FROM session` to inspect active sessions, write queries against it, and apply DB-level constraints. Keeps the auth layer in the DB where CMSC 127 can evaluate it.

> Ties to CMSC 127 goal: sessions are just rows; login/logout are just `INSERT`/`DELETE` — no magic.

**Libraries:**
- `bcryptjs` — hash passwords at registration, compare at login (`npm install bcryptjs`)
- `jose` — sign/verify session token stored in an `HttpOnly` cookie (`npm install jose`)

**Debatable:** `iron-session` (encrypted cookie, no DB table) is simpler and perfectly secure. Tradeoff: no session rows to inspect or query — loses the CMSC 127 teaching value. Auth.js / Supabase Auth hide the entire auth data layer — avoid.

---

### Input Validation — Zod

**Rationale:** Schema-based validation at system boundaries (API route inputs, form submissions) catches bad data before it reaches the DB. Pairs naturally with TypeScript's type system.

**Install:** `npm install zod`

---

### File Storage — None (v1 non-goal)

The ERD contains no image or file columns. Housing photos, carinderia images, and profile pictures are **out of scope for v1**. If added later, use Neon's companion object storage or a simple S3-compatible bucket — document in `DECISIONS.md`.

---

## Environment Variables

```env
# .env.local — never commit this file
DATABASE_URL=postgres://...        # Neon connection string (shared by team)
SESSION_SECRET=...                 # Random 32+ char string for jose token signing
```

Add `.env.local` to `.gitignore` immediately. Share the values via a secure channel (not GitHub).
