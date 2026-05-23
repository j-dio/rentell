# DECISIONS.md — Architectural Decision Record

Lightweight ADR log. Each entry records a decision that is not obvious from the code alone —
why it was made, what was rejected, and how it should influence future choices.

Entries are numbered and append-only. To reverse a decision, add a new entry that supersedes
the old one and reference it.

---

## #1 — Auth: schema extension for password + sessions

**Date:** 2026-05-23
**Status:** Accepted

**Context:** The ERD's `Student` entity has no credential field. Auth is a required v1 feature
(PRD Section 3.1). Two approaches were considered.

**Decision:** Extend the schema with:
- `student.password_hash VARCHAR(255) NOT NULL` — stores bcrypt hash of student's password
- New `session` table — stores active sessions as rows (session_id, student_number FK, expires_at)

**Rejected:** External auth providers (Supabase Auth, Auth.js) — these hide the auth data layer
from the team, which is the opposite of the CMSC 127 learning goal.

**Consequences:** `session` rows are queryable and inspectable like any other table, making
auth behavior visible and teachable. These two additions must be documented here and in
`SCHEMA.md` so the team knows they are intentional deviations from the ERD.

---

## #2 — DB host: Neon over local Docker or Supabase

**Date:** 2026-05-23
**Status:** Accepted

**Context:** 5-day timeline, only 2 of 5 team members are technical, others do not have Docker
set up. Three options were evaluated.

**Decision:** Neon (serverless managed Postgres). One shared `DATABASE_URL` connection string
in `.env.local`. Zero local install. Pure Postgres dialect — every raw SQL statement written
for Neon runs identically on any Postgres instance.

**Rejected:**
- Local Docker — setup cost too high for a mixed-experience team with 5 days
- Supabase — bundles auth/storage we are not using; client SDK nudges teams toward abstraction

**Consequences:** All team members connect to the same live DB. DBeaver (or TablePlus) is the
recommended GUI client for browsing tables locally. Treat the shared DB as the single source of
state — no local DB divergence.

---

## #3 — Amenity: natural PK (`name`) per ERD

**Date:** 2026-05-23
**Status:** Accepted

**Context:** The ERD defines `Amenity` with PK `name VARCHAR(50)`, and `Housing Amenity`
references it as `amenity_name`. This is a natural key, not a surrogate.

**Decision:** Preserve the ERD's design exactly. `amenity.name` is the PK; `housing_amenity`
references it as `amenity_name VARCHAR(50)`.

**Rejected:** Adding a surrogate `amenity_id INT` — would deviate from the ERD without a
compelling reason and introduce inconsistency between the schema diagram and the implementation.

**Consequences:** Amenity names must be unique. Renaming an amenity requires updating all
`housing_amenity` rows (cascaded via FK). Avoid renaming amenities post-seeding.

---

## #4 — Surrogate PKs: `GENERATED ALWAYS AS IDENTITY`

**Date:** 2026-05-23
**Status:** Accepted

**Context:** The ERD marks several PKs as `int` without specifying auto-increment behavior.
The implementation needs a concrete strategy.

**Decision:** Use `INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY` for all surrogate integer PKs
(`housing_id`, `room_id`, `carinderia_id`, `essential_id`, `review_id`, `favorite_id`).
This is the modern Postgres standard (SQL-standard identity columns), preferred over `SERIAL`.

**Rejected:** `SERIAL` — works but is a Postgres-specific shorthand that is being superseded by
identity columns. `SERIAL` also allows manual override more easily, which is error-prone.

**Consequences:** Do not INSERT a value for identity columns — let Postgres generate them.
Use `RETURNING housing_id` (etc.) after INSERT to retrieve the generated key.

---

## #5 — SQL driver: postgres.js over node-postgres or an ORM

**Date:** 2026-05-23
**Status:** Accepted

**Context:** CMSC 127 learning goal is raw SQL visibility. Several driver/ORM options exist.

**Decision:** `postgres` (postgres.js by porsager). Tagged-template literal syntax
auto-parameterizes all values, reads like SQL, and produces plain object results.

**Rejected:**
- `node-postgres (pg)` — lower-level, manual pool config, less readable
- `Drizzle ORM` — adds a type layer; ORM syntax obscures SQL structure
- `Prisma` — heavy abstraction, migrations system, not appropriate for a class project where
  the team writes DDL by hand

**Consequences:** All DB queries live in `lib/queries/*.ts` as tagged-template SQL strings.
No schema files managed by an ORM. The team controls DDL directly via `db/schema.sql`.

---

## #6 — listing_type: CHECK-constrained varchar, not a lookup table

**Date:** 2026-05-23
**Status:** Accepted

**Context:** `Review.listing_type` and `Favorite.listing_type` are `VARCHAR(20)` discriminators
in the ERD. Two implementation approaches were considered.

**Decision:** Keep as `VARCHAR(20)` with `CHECK (listing_type IN ('housing', 'carinderia'))`.
Valid values: `'housing'` and `'carinderia'`.

**Rejected:** A normalized `listing_type` lookup table — adds a join with no benefit in v1
since there are exactly two listing types and they are fixed.

**Consequences:** If a third listing type is ever added (e.g. `'eatery'`), the CHECK constraint
must be updated and this decision revisited. Document any such change here.

---

## Pending decisions

| # | Topic | Status |
|---|-------|--------|
| — | Image/photo attributes for Housing and Carinderia | Open — pending revised PRD |
| — | Whether students can edit or delete their own reviews | Open — pending revised PRD |
| — | Room assignment workflow (admin vs. self-service) | Open — pending revised PRD |
| — | `listing_type` normalization if a third listing type is added | Deferred to post-v1 |
