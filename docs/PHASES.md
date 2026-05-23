# PHASES.md — Phased Build Tracker

**Project:** RenTell
**Timeline:** ~5 days to submission
**Team:** 5 members (2 technical)
**Start:** App first — no landing/marketing page in v1.

> Cross-references: [PRD.md](PRD.md) · [STACK.md](STACK.md) · [SCHEMA.md](SCHEMA.md)
> Update status fields here as work completes. Mark `[x] Done` when all acceptance criteria pass.

---

## Phase Overview

| # | Phase | Suggested Day | Status |
|---|-------|--------------|--------|
| 0 | Project Setup & Config | Day 1 AM | [ ] Not started |
| 1 | Database Schema (DDL) | Day 1 PM | [ ] Not started |
| 2 | Auth | Day 2 | [ ] Not started |
| 3 | Core Directory | Day 3 | [ ] Not started |
| 4 | Reviews & Ratings | Day 4 AM | [ ] Not started |
| 5 | Favorites | Day 4 PM | [ ] Not started |
| 6 | Search & Filter | Day 5 AM | [ ] Not started |
| 7 | UI Polish | Day 5 PM | [ ] Not started |
| 8 | Trigger Showcases *(optional)* | Day 5 evening | [ ] Not started |

---

## Phase 0 — Project Setup & Configuration

**Goal:** Working Next.js app connected to Neon. Every team member can run the project and query the database.

**PRD ref:** N/A (prerequisite)

### Files / packages
- `package.json` — Next.js 14, postgres, bcryptjs, jose, zod, tailwindcss, shadcn/ui
- `next.config.ts`
- `.env.local` — `DATABASE_URL`, `SESSION_SECRET` (never commit)
- `.gitignore` — must include `.env.local`
- `lib/db.ts` — single exported `sql` client (postgres.js instance, shared across the app)
- `tailwind.config.ts`, `postcss.config.js`

### Acceptance criteria
- [ ] `npm run dev` starts with no errors
- [ ] `lib/db.ts` exports a working `sql` client; a test query `SELECT 1` returns successfully
- [ ] `.env.local` is in `.gitignore` and never pushed
- [ ] All 5 team members have cloned the repo, copied `.env.local`, and can run `npm run dev`
- [ ] DBeaver (or equivalent) connected to Neon for all team members

---

## Phase 1 — Database Schema (DDL)

**Goal:** All tables created in Neon with correct column types, primary keys, foreign keys, and constraints. Seed data loaded.

**PRD ref:** Section 4 (Data Model), Section 5 (DB-Level Constraints)

### Tables created
All tables from ERD + schema extensions:

| Table | Source |
|-------|--------|
| `student` | ERD + `password_hash` extension |
| `housing` | ERD |
| `room` | ERD |
| `carinderia` | ERD |
| `essential` | ERD |
| `amenity` | ERD |
| `housing_essential` | ERD junction |
| `housing_amenity` | ERD junction |
| `review` | ERD |
| `favorite` | ERD |
| `session` | Schema extension (auth) |

### Files
- `db/schema.sql` — full DDL: all CREATE TABLE statements, constraints, defaults
- `db/seed.sql` — 3–5 housing records, 2–3 carinderia records, sample amenities/essentials, 1–2 test students

### Constraints to include (from PRD Section 5)
- `CHECK (rating BETWEEN 1 AND 5)` on `review`
- `CHECK (listing_type IN ('housing', 'carinderia'))` on `review` and `favorite`
- XOR CHECK on `review`: exactly one of `housing_id` / `carinderia_id` is non-null, matching `listing_type`
- XOR CHECK on `favorite`: same pattern
- `UNIQUE (student_number, listing_type, housing_id, carinderia_id)` on `favorite`
- `DEFAULT CURRENT_DATE` on `review.date_posted` and `favorite.date_saved`
- `DEFAULT NOW()` on `session.created_at`
- Composite PKs on `housing_essential` and `housing_amenity`
- `session.student_number REFERENCES student(student_number) ON DELETE CASCADE`

### Acceptance criteria
- [ ] All 11 tables visible in DBeaver/Neon console
- [ ] `\d tablename` (or DBeaver table inspector) shows all columns, types, PKs, FKs
- [ ] Inserting a review with `rating = 0` or `rating = 6` is rejected by DB
- [ ] Inserting a review with both `housing_id` and `carinderia_id` non-null is rejected
- [ ] Inserting a duplicate favorite (same student + listing) is rejected
- [ ] Seed data is queryable: `SELECT * FROM housing` returns rows

---

## Phase 2 — Auth

**Goal:** Students can register, log in, and log out. Session stored in DB. Protected routes redirect unauthenticated users.

**PRD ref:** Section 3.1

### Files
- `lib/auth.ts` — `hashPassword`, `verifyPassword` (bcryptjs wrappers)
- `lib/session.ts` — `createSession`, `getSession`, `deleteSession` (jose + DB queries against `session` table)
- `app/api/auth/register/route.ts` — POST: validate input (Zod), insert Student row, hash password
- `app/api/auth/login/route.ts` — POST: lookup student, verify hash, INSERT session row, set cookie
- `app/api/auth/logout/route.ts` — POST: DELETE session row, clear cookie
- `middleware.ts` — redirect unauthenticated requests on protected paths
- `app/(auth)/register/page.tsx` — registration form (shadcn/ui Form)
- `app/(auth)/login/page.tsx` — login form (shadcn/ui Form)
- `components/UserNav.tsx` — shows student name + logout button when logged in

### Tables touched
`student` (INSERT, SELECT), `session` (INSERT, SELECT, DELETE)

### Acceptance criteria
- [ ] New student can register; row appears in `student` table with hashed (not plain-text) password
- [ ] Registered student can log in; row appears in `session` table; cookie is set
- [ ] Navigating to a protected page without a session redirects to `/login`
- [ ] Logging out deletes the session row; cookie is cleared
- [ ] Registering with an already-used `student_number` returns an error (PK violation handled gracefully)
- [ ] Zod validates all required fields on register and login before touching the DB

---

## Phase 3 — Core Directory

**Goal:** Housing and Carinderia listing pages (browse) and detail pages (full info) are functional.

**PRD ref:** Sections 3.2, 3.3

### Files
- `lib/queries/housing.ts` — `getAllHousing()`, `getHousingById(id)` (raw SQL via `lib/db.ts`)
- `lib/queries/carinderia.ts` — `getAllCarinderias()`, `getCarinderiaById(id)`
- `app/(directory)/housing/page.tsx` — listing page: cards with name, type, price range, proximity, avg rating
- `app/(directory)/housing/[id]/page.tsx` — detail page: all Housing fields + room list + amenities + nearby essentials + reviews (reviews displayed, not writable yet)
- `app/(directory)/carinderias/page.tsx` — listing page: cards with name, address, avg rating
- `app/(directory)/carinderias/[id]/page.tsx` — detail page: all Carinderia fields + reviews
- `components/HousingCard.tsx`, `components/CarinderiaCard.tsx`
- `components/RoomList.tsx`, `components/AmenityList.tsx`, `components/EssentialList.tsx`
- `app/layout.tsx` — shared nav (links to Housing, Carinderias, Login/Register or UserNav)

### Tables touched
`housing`, `room`, `carinderia`, `essential`, `amenity`, `housing_essential`, `housing_amenity`

### Key SQL patterns
- Detail page housing query: JOIN `room`, JOIN `housing_amenity` + `amenity`, JOIN `housing_essential` + `essential`
- Average rating: subquery `(SELECT AVG(rating) FROM review WHERE housing_id = $1)`

### Acceptance criteria
- [ ] `/housing` lists all housing records from DB; each card shows name, type, price range, proximity, rating
- [ ] `/housing/[id]` shows full detail for one Housing record including rooms, amenities, essentials
- [ ] `/carinderias` lists all carinderia records
- [ ] `/carinderias/[id]` shows full carinderia detail
- [ ] All queries are raw SQL in `lib/queries/` — no ORM calls
- [ ] Pages work for unauthenticated users (public browse)

---

## Phase 4 — Reviews & Ratings

**Goal:** Authenticated students can submit reviews for Housing and Carinderia listings. Reviews display on detail pages.

**PRD ref:** Section 3.4

### Files
- `lib/queries/reviews.ts` — `getReviewsByHousing(id)`, `getReviewsByCarinderia(id)`, `createReview(data)`
- `app/api/reviews/route.ts` — POST: auth check, Zod validate, INSERT into `review`
- `components/ReviewForm.tsx` — star rating selector (1–5) + comment textarea + submit; shown only when logged in
- `components/ReviewList.tsx` — renders list of reviews with student name, rating, comment, date
- Update `app/(directory)/housing/[id]/page.tsx` — include ReviewForm + ReviewList
- Update `app/(directory)/carinderias/[id]/page.tsx` — include ReviewForm + ReviewList

### Tables touched
`review` (INSERT, SELECT), `student` (SELECT name for display)

### Acceptance criteria
- [ ] Logged-in student can submit a review; row appears in `review` table
- [ ] Rating outside 1–5 is rejected by the DB CHECK constraint (test with direct insert)
- [ ] Review appears immediately on the listing detail page after submission
- [ ] Unauthenticated users see reviews but not the form
- [ ] `listing_type` + XOR FK are correctly set by the API (housing or carinderia, not both)
- [ ] Reviewer's `first_name` and `last_name` display alongside the review

---

## Phase 5 — Favorites

**Goal:** Authenticated students can save and unsave listings. A dedicated favorites page shows all saved items.

**PRD ref:** Section 3.5

### Files
- `lib/queries/favorites.ts` — `getFavoritesByStudent(student_number)`, `addFavorite(data)`, `removeFavorite(data)`, `isFavorited(student_number, listingType, id)`
- `app/api/favorites/route.ts` — POST (add), DELETE (remove): auth check, Zod validate, INSERT/DELETE `favorite`
- `components/FavoriteButton.tsx` — heart/bookmark toggle; calls API; shown only when logged in
- `app/favorites/page.tsx` — protected page; lists all saved listings with type badge + date_saved; links to detail pages
- Update Housing and Carinderia listing/detail pages to include `FavoriteButton`

### Tables touched
`favorite` (INSERT, SELECT, DELETE), `housing` (SELECT for display), `carinderia` (SELECT for display)

### Acceptance criteria
- [ ] Logged-in student can save a listing; row appears in `favorite` table
- [ ] Saving the same listing twice is rejected by the UNIQUE constraint (handled gracefully in UI)
- [ ] Unsaving removes the row from `favorite`
- [ ] `/favorites` shows all saved listings for the current student only
- [ ] Unauthenticated users cannot access `/favorites` (redirected to login)
- [ ] `FavoriteButton` reflects current saved state on page load

---

## Phase 6 — Search & Filter

**Goal:** Students can search listings by text and filter Housing by type, price range, proximity, and amenities.

**PRD ref:** Section 3.6

### Files
- `lib/queries/search.ts` — parameterized SQL with dynamic WHERE clauses for housing and carinderia
- `components/SearchBar.tsx` — text input, updates URL query params
- `components/HousingFilterPanel.tsx` — housing_type select, price range inputs, proximity slider, amenity checkboxes, sort select
- Update `app/(directory)/housing/page.tsx` — read URL search params, pass to query, render FilterPanel
- Update `app/(directory)/carinderias/page.tsx` — text search only in v1

### Tables touched
`housing`, `carinderia`, `housing_amenity` (JOIN for amenity filter), `review` (subquery for avg rating sort)

### Key SQL pattern
Build parameterized WHERE clause server-side — never interpolate unsanitized user input. Use the `postgres` tagged-template approach for all dynamic values.

### Acceptance criteria
- [ ] Text search on Housing returns listings matching name, address, or description
- [ ] housing_type filter returns only matching types
- [ ] Price range filter returns listings within the selected min/max
- [ ] Proximity filter returns listings within the specified km
- [ ] Sort by proximity and sort by average rating both work
- [ ] All filters combinable (AND logic)
- [ ] Empty results state displays a helpful message
- [ ] Text search on Carinderia returns matching carinderias

---

## Phase 7 — UI Polish

**Goal:** Consistent, polished design across all pages. Loading states, empty states, and error messages present. Responsive on common screen sizes.

**PRD ref:** Section 7 (success metrics — UI polished)

### Files
- `app/layout.tsx` — finalize nav, footer, global font
- `app/globals.css` — Tailwind base, custom tokens if any
- All page and component files — add `loading.tsx` / `error.tsx` siblings where missing
- `components/ui/` — verify shadcn/ui component usage is consistent (no mixed raw HTML tables and shadcn cards)
- `components/RatingStars.tsx` — visual star display for average ratings on cards

### Acceptance criteria
- [ ] All pages use shadcn/ui components consistently (no unstyled raw `<table>` or `<button>`)
- [ ] Each page that fetches data has a loading state (Next.js `loading.tsx` or Suspense)
- [ ] Each listing page has an empty-state message when no results exist
- [ ] Form errors display inline (Zod validation messages surface in the UI)
- [ ] Nav shows correct state: login/register links when logged out; student name + logout when logged in
- [ ] Layout does not break at 768px (tablet) and 1280px (desktop) widths

---

## Phase 8 — Trigger Showcases *(optional — only if time permits)*

**Goal:** Demonstrate DB-level automation with PostgreSQL triggers for extra CMSC 127 depth.

**PRD ref:** Section 5 (Trigger candidates)

### Trigger 1 — Average rating (denormalized)
- Add `avg_rating NUMERIC(3,2)` column to `housing` and `carinderia` (schema extension — log in `DECISIONS.md`)
- Create trigger: AFTER INSERT / UPDATE / DELETE on `review` → recompute `AVG(rating)` and UPDATE the parent listing
- Replaces the subquery approach used in Phase 3

### Trigger 2 — Room availability
- Create trigger: AFTER INSERT / UPDATE / DELETE on `student` (on `room_id`) → count students in the room; set `room.is_available = (count < capacity)`

### Files
- `db/triggers.sql` — trigger function definitions and CREATE TRIGGER statements

### Acceptance criteria
- [ ] Inserting a new review updates `housing.avg_rating` or `carinderia.avg_rating` automatically (verify with SELECT after INSERT)
- [ ] Assigning a student to a room that is at capacity sets `room.is_available = false`
- [ ] Triggers survive a Neon connection reset (they are DDL-level, not app-level)
