# PRD.md — Product Requirements Document

**Project:** RenTell
**Course:** CMSC 127 — Relational Database Management Systems
**Team size:** 5
**Timeline:** ~5 days to submission
**Status:** v1 draft — a revised PRD (with image attributes and further refinements) will supersede this document. See `DECISIONS.md` for pending changes.

> Schema source of truth: `ERD/Rentell Physical ERD (3).json`.
> Stack decisions: `STACK.md`.
> Build order: `PHASES.md`.

---

## 1. Problem Statement

UP Cebu students searching for off-campus housing or nearby food options must rely on word-of-mouth, scattered Facebook posts, and informal group chats. There is no structured, searchable directory where students can find boarding houses, dormitories, and carinderias — and no verified, student-authored review system to help them evaluate options.

**RenTell** solves this by providing a centralized, relational-database-backed directory where students can browse listings, read and write reviews, and save favorites — all scoped to the UP Cebu student community.

---

## 2. Target Users

| User type | Description |
|-----------|-------------|
| **Student (primary)** | Any enrolled UP Cebu student. Browses listings, writes reviews, saves favorites. Must register with a student number. |
| **Prospective tenant** | Student actively looking for housing. Uses search and filter heavily. |
| **Returning user** | Student who has already settled in; contributes reviews for housing/carinderias they have experienced. |

> Non-user (v1): property owners, admins, moderators. No owner-facing portal in v1.

---

## 3. Core Features

### 3.1 User Authentication
Students register and log in using their student number and a password.

- Register: provide student_number, first_name, last_name, email, course, year_level, hometown, password.
- Login: student_number + password → server validates, creates a session row, sets an HttpOnly cookie.
- Logout: deletes the session row.
- Protected routes: any write action (review, favorite) requires an active session.

> DB note: `Student.password_hash` and the `Session` table are schema extensions not in the ERD — documented in `DECISIONS.md`.

### 3.2 Housing Directory
Browse and view boarding houses and dormitories.

- Listing card: name, housing_type, address, monthly_price_min–max, proximity_to_campus_km, average rating.
- Detail page: all Housing fields + room list (room_number, room_type, capacity, monthly_price, is_available) + amenity list + nearby essentials (name, type, distance_km) + all reviews.
- Housing types supported: whatever values appear in `housing_type` — no hard-coded enum in v1 (use a CHECK or domain if standardized later).

### 3.3 Carinderia Directory
Browse and view carinderias / nearby eateries.

- Listing card: name, address, description, average rating.
- Detail page: all Carinderia fields + all reviews.

> Note: `Essential` entities (groceries, laundromats, pharmacies, etc.) are supplementary proximity data attached to Housing — they are **not** independently browsable listings in v1.

### 3.4 Reviews & Ratings
Authenticated students write reviews for Housing or Carinderia listings.

- Fields: rating (1–5 stars), comment (up to 500 chars), date_posted (auto-set).
- One student may review the same listing multiple times (no unique constraint in ERD) — but UI should surface the student's existing review if one exists.
- Reviews display: commenter name, rating, comment, date.
- Aggregate: average rating computed via SQL `AVG(rating)` — optionally maintained by a trigger (see PHASES.md Phase 5).

### 3.5 Favorites
Authenticated students save Housing or Carinderia listings to a personal favorites list.

- Save / unsave toggle on listing cards and detail pages.
- Favorites list page: shows all saved listings with type badge (housing / carinderia) and date_saved.
- Constraint: one student cannot save the same listing twice (UNIQUE enforced at DB level).

### 3.6 Search & Filter
Students can search and filter the directory without logging in.

- Search: text search across Housing name, address, description; Carinderia name, address, description.
- Filters (Housing): housing_type, monthly_price range, proximity_to_campus_km range, amenities present, is_available rooms exist.
- Filters (Carinderia): free-text only in v1.
- Sort: by proximity, by price (housing), by average rating.

---

## 4. Data Model Summary

All entities and relationships are derived directly from `ERD/Rentell Physical ERD (3).json`.

### Entities

| Entity | PK | Key fields | Notes |
|--------|----|----|-------|
| `Student` | student_number (varchar 15) | first_name, last_name, email, course, year_level, hometown, room_id (FK) | +password_hash (schema extension) |
| `Housing` | housing_id (int) | name, housing_type, address, monthly_price_min, monthly_price_max, contact_person, contact_number, proximity_to_campus_km, description | Primary directory listing type |
| `Room` | room_id (int) | housing_id (FK), room_number, room_type, capacity, monthly_price, is_available | Child of Housing |
| `Carinderia` | carinderia_id (int) | name, address, description | Second directory listing type |
| `Essential` | essential_id (int) | name, type, address, description | Supplementary; linked to Housing via junction |
| `Amenity` | name (varchar 50) | description | Natural PK — amenity name is the key |
| `Review` | review_id (int) | student_number (FK), listing_type, housing_id (FK nullable), carinderia_id (FK nullable), rating, comment, date_posted | Polymorphic — targets Housing OR Carinderia |
| `Favorite` | favorite_id (int) | student_number (FK), listing_type, housing_id (FK nullable), carinderia_id (FK nullable), date_saved | Polymorphic — same pattern as Review |

### Junction tables

| Table | PKs | Extra column |
|-------|-----|-------------|
| `Housing Essential` | housing_id + essential_id | distance_km float(4,2) |
| `Housing Amenity` | housing_id + amenity_name | — |

### Schema extension (not in ERD)

| Addition | Table | Rationale |
|----------|-------|-----------|
| `password_hash VARCHAR(255) NOT NULL` | Student | Required for auth; documented in `DECISIONS.md` |
| `Session` table | new | session_id, student_number FK, expires_at, created_at; required for auth |

---

## 5. DB-Level Constraints (CMSC 127 depth)

These must be enforced in DDL — not just in application code.

| Constraint | Table | Expression |
|-----------|-------|------------|
| Rating range | Review | `CHECK (rating BETWEEN 1 AND 5)` |
| listing_type values | Review, Favorite | `CHECK (listing_type IN ('housing', 'carinderia'))` |
| Polymorphic XOR — Review | Review | `CHECK ((listing_type = 'housing' AND housing_id IS NOT NULL AND carinderia_id IS NULL) OR (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id IS NULL))` |
| Polymorphic XOR — Favorite | Favorite | Same XOR pattern as Review |
| No duplicate favorites | Favorite | `UNIQUE (student_number, listing_type, housing_id, carinderia_id)` |
| Composite PKs | Housing Essential, Housing Amenity | Enforced via compound PRIMARY KEY declarations |
| Session cascade | Session | `REFERENCES student(student_number) ON DELETE CASCADE` |
| Auto-dates | Review, Favorite | `DEFAULT CURRENT_DATE` on date_posted / date_saved |

### Trigger candidates (showcase for CMSC 127)
- **Average rating trigger:** After INSERT/UPDATE/DELETE on `Review`, recompute and store average rating on `Housing` or `Carinderia` (requires adding an `avg_rating` column — document as schema extension if implemented).
- **Room availability trigger:** After INSERT/UPDATE on `Student.room_id`, update `Room.is_available` based on current occupant count vs. capacity.

> These are optional showcases — implement only if time allows. Mark as such in `PHASES.md`.

---

## 6. V1 Non-Goals

These are explicitly out of scope for the initial submission. They may be addressed in a revised PRD.

| Non-goal | Reason deferred |
|----------|----------------|
| Housing / carinderia photos | No image columns in ERD; storage setup adds scope. Flagged for revised PRD. |
| Owner-facing portal | No property owner entity in ERD; admin scope too large for 5 days. |
| Admin moderation | No admin role in ERD. |
| Maps / geolocation UI | proximity_to_campus_km is a numeric field — no lat/lng in ERD. |
| Messaging / inquiries | No messaging entity in ERD. |
| Social features (likes, shares) | Out of course scope. |
| Pagination (server-side) | v1 can load all results; optimize post-submission. |
| Email notifications | No email infra in ERD or stack. |

---

## 7. Success Metrics

For CMSC 127 submission purposes:

| Metric | Target |
|--------|--------|
| All ERD tables created with correct types | 100% |
| All DB-level constraints present in DDL | 100% (see Section 5) |
| Auth flow works end-to-end | Register → login → protected action → logout |
| Housing + Carinderia directory browsable | Both listing and detail pages functional |
| Reviews submittable and displayed | Rating + comment visible on detail page |
| Favorites saveable and listed | Toggle works; favorites page shows saved items |
| Search returns relevant results | At least one filter per listing type works |
| UI is polished | Consistent design system (shadcn/ui), no broken layouts |

---

## 8. Open Questions (pending revised PRD)

- Will photo/image attributes be added to Housing and/or Carinderia?
- Should `listing_type` be normalized into a lookup table, or remain a CHECK-constrained varchar?
- Should students be able to edit or delete their own reviews?
- Is a room assignment workflow (assign student to a room) in scope, or is `Student.room_id` populated only by admin/seed data?
