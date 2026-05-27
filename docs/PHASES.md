# PHASES.md — Phased Build Tracker

**Project:** RenTell
**Timeline:** ~5 days to submission
**Team:** 5 members (2 technical)
**Start:** App first — no landing/marketing page in v1.

> Cross-references: [PRD.md](PRD.md) · [STACK.md](STACK.md) · [SCHEMA.md](SCHEMA.md)
> Update status fields here as work completes. Mark `[x] Done` when all acceptance criteria pass.

---

## Phase Overview

| # | Phase | Suggested Day | Scope | Status |
|---|-------|--------------|-------|--------|
| 0 | Project Setup & Config | Day 1 AM | MVP | [x]  |
| 1 | Database Schema (DDL) | Day 1 PM | MVP | [x] Done |
| 2 | Auth | Day 2 AM | MVP | [x] Done |
| 3 | Core Directory | Day 2 PM – Day 3 AM | MVP | [x] Done |
| 4 | Host Portal | Day 3 PM | MVP | [x] Done |
| 5 | Reviews & Ratings | Day 4 AM | MVP | [x] Done |
| 6 | Favorites | Day 4 PM | MVP | [x] Done |
| 7 | Search & Filter | Day 5 AM | MVP | [ ] Not started |
| 8 | UI Polish | Day 5 PM | MVP | [x] Done (partial) |
| 9 | Book a Visit | If time permits | Stretch | [x] Done |
| 10 | Trigger Showcases | If time permits | Stretch | [x] Done |
| 11 | Messaging UI | Post-submission | Stretch | [ ] Not started |
| 12 | Carinderia Management & Unified Listings | Post-submission | Stretch | [x] Done |

---

## Phase 0 — Project Setup & Configuration

**Goal:** Working Next.js app connected to Neon. Every team member can run the project and query the DB.

**PRD ref:** N/A (prerequisite)

### Files / packages
- `package.json` — Next.js 14, postgres, bcryptjs, jose, zod, tailwindcss, shadcn/ui
- `next.config.ts`
- `.env.local` — `DATABASE_URL`, `SESSION_SECRET` (never commit)
- `.gitignore` — must include `.env.local`
- `lib/db.ts` — single exported `sql` client (postgres.js instance)
- `tailwind.config.ts`, `postcss.config.js`

### Acceptance criteria
- [x] `npm run dev` starts with no errors
- [x] `lib/db.ts` exports a working `sql` client; `SELECT 1` returns successfully
- [x] `.env.local` is in `.gitignore` and never pushed
- [x] All 5 team members have cloned the repo, copied `.env.local`, and can run `npm run dev`
- [x] DBeaver (or equivalent) connected to Neon for at least the 2 technical members

---

## Phase 1 — Database Schema (DDL)

**Goal:** All 19 tables created in Neon with correct column types, PKs, FKs, and constraints. Seed data loaded.

**PRD ref:** Section 4 (Data Model), Section 5 (DB-Level Constraints)

### Tables (creation order — respects FK dependencies)

| Group | Tables |
|-------|--------|
| Accounts | `users`, `session` |
| Listings | `housing`, `room`, `carinderia`, `essential` |
| Catalog | `amenity` |
| Junctions | `housing_amenity`, `housing_essential`, `housing_carinderia` |
| Media | `housing_image`, `room_image`, `carinderia_image` |
| Reviews & Favorites | `review`, `favorite` |
| Visits | `housing_visiting_hours`, `visit` |
| Messaging (schema only) | `conversation`, `message` |

### Files
- `db/schema.sql` — full DDL in dependency order (copy from `SCHEMA.md` Full DDL section)
- `db/seed.sql` — 3–5 housing records (with rooms + images + amenities), 2–3 carinderia records, sample essentials, 2 test users (one student, one host)

### Constraints to verify after running DDL
- `available_slots >= 0` AND `available_slots <= capacity` on `room`
- `CHECK (rating BETWEEN 1 AND 5)` on `review`
- XOR CHECK on `review` and `favorite`
- `UNIQUE (user_id, listing_type, housing_id, carinderia_id)` on `favorite`
- `CHECK (status IN (...))` on `visit`
- `CHECK (end_time > start_time)` on `housing_visiting_hours`
- `CHECK (user_one_id < user_two_id)` on `conversation`

### Acceptance criteria
- [x] All 19 tables visible in DBeaver / Neon console
- [x] `available_slots = -1` on room insert is rejected
- [x] `rating = 6` on review insert is rejected
- [x] Review with both `housing_id` and `carinderia_id` non-null is rejected
- [x] Duplicate favorite (same user + listing) is rejected --> PASSED AFTER UNIQUE constraint fix in DECISIONS.md #15
- [x] `end_time < start_time` on visiting_hours insert is rejected
- [x] Seed data queryable: `SELECT * FROM housing` returns rows

---

## Phase 2 — Auth

**Goal:** Users can register, log in, and log out. Session stored in DB. Protected routes redirect unauthenticated users.

**PRD ref:** Section 3.1

### Files
- `lib/auth.ts` — `hashPassword`, `verifyPassword` (bcryptjs wrappers)
- `lib/session.ts` — `createSession`, `getSession`, `deleteSession` (jose + DB queries on `session` table)
- `app/api/auth/register/route.ts` — POST: Zod validate, INSERT users row, hash password
- `app/api/auth/login/route.ts` — POST: lookup by email, verify hash, INSERT session, set cookie
- `app/api/auth/logout/route.ts` — POST: DELETE session row, clear cookie
- `middleware.ts` — redirect unauthenticated requests on protected paths
- `app/(auth)/register/page.tsx` — registration form (shadcn/ui Form)
- `app/(auth)/login/page.tsx` — login form (shadcn/ui Form)
- `components/UserNav.tsx` — shows user name + logout button when logged in

### Tables touched
`users` (INSERT, SELECT), `session` (INSERT, SELECT, DELETE)

### Acceptance criteria
- [x] New user can register; row appears in `users` table with hashed (not plain-text) password
- [x] Registered user can log in; row appears in `session` table; cookie is set
- [x] Navigating to a protected page without a session redirects to `/login`
- [x] Logging out deletes the session row; cookie is cleared
- [x] Registering with a duplicate email returns an error (UNIQUE violation handled gracefully)
- [x] Zod validates all required fields before touching the DB

---

## Phase 3 — Core Directory

**Goal:** Housing and Carinderia listing and detail pages are functional for public browse.

**PRD ref:** Sections 3.2, 3.3

### Files
- `lib/queries/housing.ts` — `getAllHousing()`, `getHousingById(id)`
- `lib/queries/carinderia.ts` — `getAllCarinderias()`, `getCarinderiaById(id)`
- `app/(directory)/housing/page.tsx` — listing page: cards with name, type, price range, proximity, primary image, avg rating
- `app/(directory)/housing/[id]/page.tsx` — detail: all fields + room list (with available_slots) + amenities + nearby carinderias + nearby essentials + photo gallery + reviews section
- `app/(directory)/carinderias/page.tsx` — listing page: cards with name, address, primary image, avg rating
- `app/(directory)/carinderias/[id]/page.tsx` — detail: all fields + photo gallery + reviews section *(image management for contributors was moved to `/carinderias/[id]/manage` in Phase 12 — this page no longer contains `CarinderiaImageForm`)*
- `components/HousingCard.tsx`, `components/CarinderiaCard.tsx`
- `components/RoomList.tsx`, `components/AmenityList.tsx`, `components/NearbyList.tsx`
- `components/ImageGallery.tsx`
- `app/layout.tsx` — shared nav (links to Housing, Carinderias, Login/Register or UserNav)

### Tables touched
`housing`, `room`, `carinderia`, `essential`, `amenity`, `housing_amenity`, `housing_essential`, `housing_carinderia`, `housing_image`, `room_image`, `carinderia_image`

### Key SQL patterns
- Detail page housing: JOIN room, JOIN housing_amenity + amenity, JOIN housing_carinderia + carinderia, JOIN housing_essential + essential, JOIN housing_image
- Avg rating: subquery `(SELECT AVG(rating) FROM review WHERE housing_id = $1 AND listing_type = 'housing')`
- Primary image: `WHERE is_primary = true LIMIT 1` (fallback to first image if none marked primary)
- Available rooms count: `SELECT COUNT(*) FROM room WHERE housing_id = $1 AND available_slots > 0`

### Acceptance criteria
- [x] `/housing` lists all housing records; each card shows name, type, price range, proximity, image, avg rating
- [x] `/housing/[id]` shows full detail including rooms with available_slots, amenities, nearby places, gallery
- [x] `/carinderias` lists all carinderia records
- [x] `/carinderias/[id]` shows full carinderia detail with gallery
- [x] All queries are raw SQL in `lib/queries/` — no ORM calls
- [x] Pages work for unauthenticated users

---

## Phase 4 — Host Portal

**Goal:** Users with `is_host = true` can create and manage housing listings, rooms, images, visiting hours, and nearby-place links.

**PRD ref:** Section 3.4

### Files
- `lib/queries/host.ts` — `createHousing`, `updateHousing`, `deleteHousing`, `createRoom`, `updateRoom`, `deleteRoom`, `addHousingImage`, `removeHousingImage`, `setVisitingHours`, `linkCarinderia`, `unlinkCarinderia`, `linkEssential`, `unlinkEssential`, `tagAmenity`, `untagAmenity`
- `app/api/host/housing/route.ts` — POST (create), GET (list own)
- `app/api/host/housing/[id]/route.ts` — PUT (update), DELETE
- `app/api/host/housing/[id]/rooms/route.ts` — POST, PUT, DELETE
- `app/api/host/housing/[id]/images/route.ts` — POST (add URL), DELETE
- `app/api/host/housing/[id]/visiting-hours/route.ts` — POST, DELETE
- `app/api/host/housing/[id]/nearby/route.ts` — POST/DELETE for carinderia + essential links
- `app/(host)/dashboard/page.tsx` — redirects to `/listings` (see Phase 12); originally listed owner's housing listings
- `app/(host)/dashboard/new/page.tsx` — create housing form (multi-step: Basic Info → Add Photos → Add Rooms; see Phase 12 for StepIndicator)
- `app/(host)/dashboard/[id]/page.tsx` — manage a single listing (rooms, images, hours, nearby, amenities)
- `components/host/RoomForm.tsx`, `ImageURLForm.tsx`, `VisitingHoursForm.tsx`, `NearbyAttachForm.tsx`
- `app/profile/page.tsx` — profile page with "Become a host" toggle (sets `is_host = true`)
- `app/listings/page.tsx` — unified listings page for all authenticated users (added Phase 12)
- `app/(directory)/carinderias/[id]/manage/page.tsx` — carinderia management page for contributors (added Phase 12)
- `components/CarinderiaEditForm.tsx` — inline edit form for carinderia fields (added Phase 12)
- `components/DeleteCarinderiaButton.tsx` — confirm-and-delete button for carinderias (added Phase 12)
- `components/host/HousingDetailsForm.tsx` — basic-details edit form for housing (added Phase 12)
- `components/StepIndicator.tsx` — shared progress indicator for multi-step creation flows (added Phase 12)

### Tables touched
`housing`, `room`, `housing_image`, `room_image`, `housing_visiting_hours`, `housing_amenity`, `housing_essential`, `housing_carinderia`, `users` (is_host update)

### Notes
- Images stored as URLs only — no file upload in v1. Hosts paste a public image URL.
- Only the listing's `owner_id` may edit it (enforce in API: `WHERE owner_id = session.user_id`).

### Acceptance criteria
- [x] User can toggle `is_host` from profile; `users.is_host` updates in DB
- [x] Host can create a housing listing; row appears in `housing` table with correct `owner_id`
- [x] Host can add/edit/delete rooms; `available_slots` is editable and constrained by DB CHECK
- [x] Host can add image URLs; rows appear in `housing_image`
- [x] Host can set visiting hours; rows appear in `housing_visiting_hours`; duplicate slot is rejected
- [x] Host can link carinderias and essentials to their listing with distance_km
- [x] Non-owner cannot edit another host's listing (returns 403)
- [x] Newly created listing appears on public `/housing` page

---

## Phase 5 — Reviews & Ratings

**Goal:** Authenticated users can submit, edit, and delete reviews for Housing and Carinderia listings.

**PRD ref:** Section 3.5

### Files
- `lib/queries/reviews.ts` — `getReviewsByHousing(id)`, `getReviewsByCarinderia(id)`, `createReview`, `updateReview`, `deleteReview`
- `app/api/reviews/route.ts` — POST: auth check, Zod validate, INSERT review
- `app/api/reviews/[id]/route.ts` — PUT (update), DELETE: auth check, verify reviewer_id = session user
- `components/ReviewForm.tsx` — star selector (1–5) + comment textarea; shown only when logged in
- `components/ReviewList.tsx` — reviewer name, rating, comment, date; edit/delete buttons for own reviews
- Update `app/(directory)/housing/[id]/page.tsx` — include ReviewForm + ReviewList
- Update `app/(directory)/carinderias/[id]/page.tsx` — include ReviewForm + ReviewList

### Tables touched
`review` (INSERT, SELECT, UPDATE, DELETE), `users` (SELECT name for display)

### Acceptance criteria
- [x] Logged-in user can submit a review; row appears in `review` table
- [x] `rating = 0` or `rating = 6` is rejected by DB CHECK
- [x] Review appears on listing detail page after submission
- [x] Unauthenticated users see reviews but not the form
- [x] User can edit their own review; updated_at changes
- [x] User can delete their own review; row removed from DB
- [x] User cannot edit or delete another user's review (403)
- [x] XOR FK is correctly set (housing or carinderia, not both)

---

## Phase 6 — Favorites

**Goal:** Authenticated users can save and unsave listings. A dedicated favorites page shows all saved items.

**PRD ref:** Section 3.6

### Files
- `lib/queries/favorites.ts` — `getFavoritesByUser(user_id)`, `addFavorite`, `removeFavorite`, `isFavorited`
- `app/api/favorites/route.ts` — POST (add), DELETE (remove): auth check, Zod validate
- `components/FavoriteButton.tsx` — heart toggle; calls API; shown only when logged in
- `app/favorites/page.tsx` — protected; lists all saved listings with type badge and date; links to detail pages
- Update Housing and Carinderia listing/detail pages to include `FavoriteButton`

### Tables touched
`favorite` (INSERT, SELECT, DELETE), `housing` (SELECT for display), `carinderia` (SELECT for display)

### Acceptance criteria
- [x] Logged-in user can save a listing; row appears in `favorite` table
- [x] Saving the same listing twice is rejected by UNIQUE constraint (handled gracefully in UI)
- [x] Unsaving removes the row
- [x] `/favorites` shows all saved listings for the current user only
- [x] Unauthenticated access to `/favorites` redirects to login
- [x] `FavoriteButton` reflects current saved state on page load

---

## Phase 7 — Search & Filter

**Goal:** Users can search listings by text and filter Housing by type, price, proximity, and amenities.

**PRD ref:** Section 3.7

### Files
- `lib/queries/search.ts` — parameterized SQL with dynamic WHERE clauses for housing and carinderia
- `components/SearchBar.tsx` — text input, updates URL query params
- `components/HousingFilterPanel.tsx` — housing_type select, price range, proximity range, amenity checkboxes, available-only toggle, sort select
- Update `app/(directory)/housing/page.tsx` — read URL search params, pass to query, render FilterPanel
- Update `app/(directory)/carinderias/page.tsx` — text search only in v1

### Tables touched
`housing`, `carinderia`, `housing_amenity` (JOIN for amenity filter), `review` (subquery for avg rating sort)

### Key SQL pattern
Build parameterized WHERE clause server-side. Never interpolate unsanitized user input — use postgres.js tagged-template for all dynamic values.

### Acceptance criteria
- [x] Text search on Housing matches name, address, or description
- [x] housing_type filter returns only matching types
- [x] Price range filter works
- [x] Proximity filter works
- [x] "Available rooms only" filter returns only housing with `available_slots > 0` on at least one room
- [x] Sort by proximity and by average rating both work
- [x] All filters combinable (AND logic)
- [x] Empty results shows a helpful message
- [x] Text search on Carinderia returns matching results

---

## Phase 8 — UI Polish

**Goal:** Consistent, polished design across all pages. Loading states, empty states, and error messages present.

**PRD ref:** Section 7 (success metrics — UI polished)

### Files
- `app/layout.tsx` — finalize nav, footer, global font
- `app/globals.css` — Tailwind base, custom tokens if any
- All page files — add `loading.tsx` / `error.tsx` siblings where missing
- `components/ui/` — verify consistent shadcn/ui usage
- `components/RatingStars.tsx` — visual star display for average ratings on cards and detail pages

### Acceptance criteria
- [ ] All pages use shadcn/ui components consistently
- [ ] Each data-fetching page has a loading state
- [ ] Each listing page has an empty-state message when no results exist
- [ ] Form errors display inline (Zod messages surfaced in UI)
- [ ] Nav shows correct state (logged out vs logged in)
- [ ] Layout holds at 768px (tablet) and 1280px (desktop)
- [ ] No console errors on any page
- [x] `/carinderias/new` uses a 2-step inline flow (Basic Info → Add Photos) with `StepIndicator`
- [x] `/dashboard/new` uses a 3-step inline flow (Basic Info → Add Photos → Add Rooms) with `StepIndicator`

---

## Phase 9 — Book a Visit *(stretch)*

**Goal:** Students can request a visit to a housing listing; owners confirm or decline.

**PRD ref:** Section 3.8

### Files
- `lib/queries/visits.ts` — `createVisit`, `getVisitsByHousing(id)`, `getVisitsByUser(id)`, `updateVisitStatus`
- `app/api/visits/route.ts` — POST: auth check, Zod validate, INSERT visit
- `app/api/visits/[id]/route.ts` — PUT (status update): auth check, verify owner or visitor
- `components/VisitRequestForm.tsx` — date/time picker + note; shown on housing detail when logged in
- `app/(host)/dashboard/[id]/visits/page.tsx` — owner view: list of pending/confirmed visits; confirm/decline buttons
- `app/visits/page.tsx` — visitor view: own visit requests and their statuses
- Update `app/(directory)/housing/[id]/page.tsx` — add VisitRequestForm + display visiting hours

### Tables touched
`visit` (INSERT, SELECT, UPDATE), `housing_visiting_hours` (SELECT for display), `housing`, `users`

### Acceptance criteria
- [x] Logged-in student can submit a visit request; row appears with status `pending`
- [x] Invalid status value is rejected by DB CHECK
- [x] Owner can confirm or decline a pending visit
- [x] Student can cancel their own pending visit
- [x] Visiting hours display on housing detail page
- [x] Host dashboard lists visits grouped by status

---

## Phase 10 — Trigger Showcases *(stretch)*

**Goal:** Demonstrate DB-level automation with PostgreSQL triggers.

**PRD ref:** Section 5 (Trigger candidates)

### Trigger 1 — Auto `updated_at`
- Function: `SET NEW.updated_at = now()` on BEFORE UPDATE.
- Apply to: `users`, `housing`, `room`, `carinderia`, `review`, `visit`.

### Trigger 2 — Average rating (denormalized)
- Add `avg_rating NUMERIC(3,2)` column to `housing` and `carinderia` (log in DECISIONS.md).
- Trigger: AFTER INSERT / UPDATE / DELETE on `review` → recompute `AVG(rating)`, UPDATE parent.
- Replaces the subquery used in Phase 3 detail queries.

### Files
- `db/triggers.sql` — all trigger function definitions and CREATE TRIGGER statements

### Acceptance criteria
- [x] `UPDATE housing SET name = name` changes `updated_at` automatically
- [x] Inserting a new review updates `housing.avg_rating` or `carinderia.avg_rating` (verify with SELECT after INSERT)
- [x] Deleting a review also recalculates avg_rating correctly
- [x] Triggers survive a Neon connection reset (DDL-level, not app-level)

---

## Phase 11 — Messaging UI *(post-submission stretch)*

**Goal:** Direct messaging between students and hosts.

**Note:** `conversation` and `message` tables already exist in the DB from Phase 1. This phase builds only the UI and API layer.

### Files
- `lib/queries/messages.ts` — `getOrCreateConversation`, `getMessages`, `sendMessage`, `markRead`
- `app/api/messages/route.ts`, `app/api/messages/[id]/route.ts`
- `app/messages/page.tsx` — inbox: list conversations
- `app/messages/[id]/page.tsx` — thread view: message history + send form
- `components/MessageBubble.tsx`, `components/ConversationList.tsx`

### Acceptance criteria
- [ ] User can start a conversation with a host from a housing detail page
- [ ] Messages thread displays in chronological order
- [ ] `read_at` updates when recipient views the message
- [ ] `user_one_id < user_two_id` canonical ordering is enforced when creating conversations
- [ ] User cannot read conversations they are not part of

---

## Phase 12 — Carinderia Management & Unified Listings *(post-submission stretch)*

**Goal:** Any logged-in user has a single place (`/listings`) to manage all their listings. Carinderias get full CRUD with image management. Housing gets basic-detail inline editing. New-listing creation uses multi-step flows with a shared `StepIndicator`.

**PRD ref:** Phase 12 scope (post-submission)

### Files
- `app/listings/page.tsx` — unified listings page; hosts see housing + carinderias sections, regular users see carinderias only; middleware-protected
- `app/(directory)/carinderias/[id]/manage/page.tsx` — carinderia management page for the contributor: inline edit, image management, delete
- `app/(host)/dashboard/page.tsx` — now simply redirects to `/listings`
- `app/(host)/dashboard/new/page.tsx` — housing creation using 3-step inline flow (Basic Info → Add Photos → Add Rooms)
- `app/carinderias/new/page.tsx` — carinderia creation using 2-step inline flow (Basic Info → Add Photos)
- `components/CarinderiaEditForm.tsx` — inline form to edit carinderia name, address, description, coordinates
- `components/DeleteCarinderiaButton.tsx` — confirm-and-delete button; calls DELETE API; redirects to `/listings` on success
- `components/host/HousingDetailsForm.tsx` — inline form to edit basic housing fields (name, type, price range, address, description, capacity, proximity)
- `components/StepIndicator.tsx` — shared step progress bar; accepts `steps: string[]` and `currentStep: number`
- `components/CarinderiaImageForm.tsx` — image add/delete for carinderias; now manages its own `images` list in `useState` (no `router.refresh`)
- `components/host/ImageURLForm.tsx` — housing image add/delete; migrated to local `useState` list management
- `components/host/RoomForm.tsx` — room add/delete; migrated to local `useState` list management

### Tables touched
`carinderia` (UPDATE, DELETE), `carinderia_image` (INSERT, DELETE), `housing` (UPDATE), `housing_image` (INSERT, DELETE), `room` (INSERT, DELETE)

### API routes
- `app/api/carinderias/[id]/route.ts` — PUT (update fields), DELETE (remove carinderia + cascade images)
- `app/api/carinderias/[id]/images/route.ts` — POST (add image URL), DELETE (remove image)
- `app/api/host/housing/[id]/route.ts` (existing) — PUT extended to accept basic-detail edits from `HousingDetailsForm`

### Acceptance criteria
- [x] All authenticated users see "My Listings" in the nav; `/listings` is middleware-protected
- [x] Hosts see a Housing section and a Carinderias section on `/listings`; regular users see only the Carinderias section
- [x] Contributor can edit carinderia name, address, description, and coordinates from `/carinderias/[id]/manage`
- [x] Contributor can add and delete carinderia images from `/carinderias/[id]/manage`; list updates without page reload
- [x] Contributor can delete their carinderia; row removed from DB and redirected to `/listings`
- [x] Non-contributor cannot access `/carinderias/[id]/manage` for another user's carinderia (403)
- [x] Host can edit basic housing details (name, type, price range, address, description) from the housing manage page
- [x] `/dashboard` (root) redirects to `/listings`; all housing sub-routes (`/dashboard/[id]`, `/dashboard/new`) remain unchanged
- [x] `/carinderias/new` 2-step flow: step 1 creates the carinderia row, step 2 adds photos, Done goes to `/listings`
- [x] `/dashboard/new` 3-step flow: step 1 creates the housing row, step 2 adds images, step 3 adds rooms, Done goes to `/listings`
- [x] `StepIndicator` shows current step highlighted; completed steps visually distinct
- [x] `ImageURLForm` and `RoomForm` manage their displayed lists in local `useState` — no `router.refresh()` needed
