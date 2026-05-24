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

## #7 — Account generalization: `Student` → `users`

**Date:** 2026-05-24
**Status:** Accepted

**Context:** The original ERD used `Student` (PK: `student_number`) as the only account entity.
This prevented non-student landlords from owning listings, and hardwired student identity fields
(`course`, `year_level`) into what should be a general auth entity.

**Decision:** Replace `Student` with a generalized `users` table. Surrogate PK `user_id INT
GENERATED ALWAYS AS IDENTITY`. Email as login credential. All student-specific fields
(`student_number`, `course`, `year_level`, `hometown`) are nullable columns on the same table —
a landlord simply leaves them blank. `is_host BOOLEAN DEFAULT false` toggles owner access.

**Rejected:**
- Two separate tables (`Student` + `Owner`) — duplicate auth logic, can't represent a student who
  is also a host, harder FK fan-out.
- Inheritance/subtype pattern — no native support in Postgres; requires EAV or joined-table tricks
  that obscure the schema.

**Consequences:** `student_number` is still present and UNIQUE — a student can still identify
themselves. The course metric (which course has the most housing searches) is derivable from
`users.course`. All FK references previously pointing to `student(student_number)` now point to
`users(user_id)`.

---

## #8 — Drop occupancy; replace with `room.available_slots`

**Date:** 2026-05-24
**Status:** Accepted

**Context:** The original ERD had `Student.room_id FK→room` to record which room a student
occupies. Two problems: (1) tenancy negotiation is off-platform (face-to-face), so the DB
would be perpetually stale; (2) it tied the account entity to a specific room, preventing
a student from browsing other options once "placed."

**Decision:** Drop the `occupies` relationship entirely. Replace `room.is_available BOOLEAN`
with `room.available_slots SMALLINT` — the owner manually updates this as people move in/out.
Two CHECK constraints enforce integrity: `available_slots >= 0` and `available_slots <= capacity`.
"Available" rooms at the housing level are a derived `COUNT(*) WHERE available_slots > 0` — never
stored, so never stale.

**Rejected:** Keeping `is_available` — a boolean gives users less information than a count; a
room might have 3 beds and 2 still open.

**Consequences:** The platform shows availability counts but never tracks *who* occupies a room.
Owners are responsible for keeping `available_slots` current. No student→room relationship in the DB.

---

## #9 — User↔listing interaction: "book a visit" instead of apply/accept/reject

**Date:** 2026-05-24
**Status:** Accepted

**Context:** The original ERD had no user↔listing interaction at all. The team considered an
"apply to rent" flow (apply → accept/reject). The problem: what criteria determine acceptance?
The platform would need to arbitrate tenancy, which is legally and practically out of scope.

**Decision:** Implement a "book a visit" flow. A user selects a date/time and submits a `visit`
row (`visitor_id`, `housing_id`, `scheduled_at`, `status`, `note`). The owner confirms or
declines. Actual tenancy is negotiated face-to-face after the visit. A companion table
`housing_visiting_hours` lets owners declare their available days/times so students only request
slots that make sense.

**Rejected:** Apply/accept/reject tenancy — would require income verification, documentation
upload, and legal liability; far exceeds the 5-day scope.

**Consequences:** The visit workflow is a stretch phase (after the directory MVP). The schema
is built now so no migration is needed when it's implemented.

---

## #10 — Carinderia/essential ownership: contributor `added_by`, no proprietor login

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Carinderias and essentials are real-world POIs near student housing. Who adds them
to the system? Requiring actual eatery/shop owners to register and log in would add onboarding
friction for businesses with no direct incentive.

**Decision:** Any logged-in user (student or host) can add a carinderia or essential. `added_by`
records the *contributor* (who entered the row), not the real-world proprietor. Carinderias are
first-class: reviewable, favoritable, have their own image table, and can be attached to multiple
housings via `housing_carinderia`. Essentials are a shared reference catalog (not reviewable).

**Rejected:**
- Admin/seed-only — requires an admin role and manual curation we don't have capacity to build.
- Real-owner claim with nullable `owner_id` — over-engineered for a 5-day build.

**Consequences:** Data quality is crowd-sourced. Duplicate entries are possible (two users add
the same carinderia). A future moderation or de-duplication pass can address this post-v1.
Real proprietors never need to interact with the platform.

---

## #11 — `housing_carinderia` junction (new)

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Hosts want to list nearby carinderias to make their listing more attractive.
Two options: (a) copy carinderia fields into the housing listing, or (b) link via a junction.

**Decision:** New `housing_carinderia` junction table — composite PK `(housing_id, carinderia_id)`,
plus `distance_km`. Mirrors the existing `housing_essential` pattern. Carinderias live in their
own table once; a housing can link to many, and a carinderia can appear near many housings.

**Rejected:** Copying carinderia data into the housing row — denormalized, can't be reviewed
independently, no shared identity across housings.

**Consequences:** Carinderia data is entered once into the `carinderia` table and referenced by
any number of housings. Owners manage the links via the housing_carinderia junction.

---

## #12 — Coordinates: `latitude`/`longitude` columns now, embedded map deferred

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Maps are important for a housing directory but full map embed (Google Maps API,
Mapbox) adds auth, billing, and complexity beyond the 5-day scope.

**Decision:** Add `latitude NUMERIC(9,6)` and `longitude NUMERIC(9,6)` to `housing`, `carinderia`,
and `essential` now. In the UI, render a simple Google Maps link
(`https://maps.google.com/?q=lat,lng`) — no embed, no API key needed. A real embedded map widget
is a post-v1 feature.

**Rejected:** Storing coordinates only as a text address — requires geocoding on read, no
coordinate-based proximity queries possible.

**Consequences:** The schema is map-ready. Proximity queries (`ORDER BY distance`) are possible
once coordinates are populated. Owners enter coordinates manually for now (or the team pre-seeds
via a geocoding script).

---

## #13 — Per-entity image tables instead of a generic `media` table

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Images are needed for housing listings, individual rooms, and carinderias. Two
structural options: one generic `media` table (polymorphic, entity_type + entity_id) or separate
tables per entity (`housing_image`, `room_image`, `carinderia_image`).

**Decision:** Separate tables per entity. Each has: `image_id PK`, parent FK with CASCADE delete,
`url TEXT`, `caption`, `is_primary BOOLEAN`, and `created_at`. `housing_image` adds `sort_order`
for gallery control. User profile pictures use `users.avatar_url TEXT` — no separate table.

**Rejected:** Generic `media` table — same polymorphic pattern pitfalls as a single listing table
(no FK enforcement on entity_id, harder to query, no type safety).

**Consequences:** Three image tables to maintain, but each has a clean FK to its parent and
CASCADE delete (delete housing → images gone). Adding a new entity type later requires a new
image table — acceptable trade-off.

---

## #14 — Messaging: design now, implement later

**Date:** 2026-05-24
**Status:** Accepted

**Context:** Direct messaging between students and hosts is a desirable feature. The question
was whether to design and build it in v1, design only, or omit entirely.

**Decision:** Design the schema now (`conversation` + `message` tables), skip the UI in v1.
`conversation` uses a canonical pair ordering CHECK (`user_one_id < user_two_id`) + UNIQUE
`(user_one_id, user_two_id, housing_id)` to prevent duplicate threads. `message.read_at` is
nullable (NULL = unread).

**Rejected:** Omitting the schema — would require a breaking migration later. Building the UI in
v1 — messaging is a stretch feature; the MVP is the directory + auth + reviews + visits.

**Consequences:** Tables exist in the DB from day one. Implementation is a named stretch phase.
The canonical pair ordering means inserting a conversation always requires sorting user IDs:
`user_one_id = MIN(a, b)`, `user_two_id = MAX(a, b)`.

---

## #15 — `favorite` uniqueness: partial indexes over table-level UNIQUE

**Date:** 2026-05-24
**Status:** Accepted

**Context:** The original schema used `UNIQUE (user_id, listing_type, housing_id, carinderia_id)`
to prevent a user from saving the same listing twice. During Phase 1 constraint testing, this
was discovered to be ineffective: PostgreSQL treats NULLs as distinct in UNIQUE constraints, so
two rows with `(user_id, 'housing', housing_id, NULL)` pass the constraint without error.

**Decision:** Drop the table-level UNIQUE constraint. Replace with two partial unique indexes
that each operate on a single XOR branch where the FK values are all concrete (non-null):

```sql
CREATE UNIQUE INDEX favorite_housing_unique
  ON favorite (user_id, listing_type, housing_id)
  WHERE carinderia_id IS NULL;

CREATE UNIQUE INDEX favorite_carinderia_unique
  ON favorite (user_id, listing_type, carinderia_id)
  WHERE housing_id IS NULL;
```

**Rejected:** Coalesce trick (`COALESCE(housing_id, 0), COALESCE(carinderia_id, 0)`) — obscures
intent, relies on the assumption that 0 is never a valid FK value (identity columns start at 1,
but it's a fragile assumption).

**Consequences:** The `favorite` table in `db/schema.sql` and `docs/SCHEMA.md` no longer has a
`UNIQUE(...)` clause in the `CREATE TABLE` body. The indexes are created as separate DDL
statements after the table. App-level duplicate handling (`ON CONFLICT`) must reference the index
name: `ON CONFLICT ON CONSTRAINT` will not work — use `INSERT … ON CONFLICT DO NOTHING` instead.

---

## Pending decisions

| # | Topic | Status |
|---|-------|--------|
| — | Whether users can edit or delete their own reviews | Open — pending PRD update |
| — | `listing_type` normalization if a third listing type is added | Deferred to post-v1 |
| — | Geocoding strategy (who enters lat/lng, any automation?) | Open — pending Phase 3 |
