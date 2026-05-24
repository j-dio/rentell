# PRD.md — Product Requirements Document

**Project:** RenTell
**Course:** CMSC 127 — Relational Database Management Systems
**Team size:** 5 (2 technical)
**Timeline:** ~5 days to submission
**Status:** v2 — updated for the redesigned ERD (generalized users, host ownership, images, visits, deferred messaging)

> Schema source of truth: `ERD/rentell.dbml` (render at dbdiagram.io).
> Full DDL and constraint reference: `SCHEMA.md`.
> Stack decisions: `STACK.md`.
> Build order: `PHASES.md`.

---

## 1. Problem Statement

Students in Cebu searching for off-campus housing near their university must rely on word-of-mouth,
scattered Facebook posts, and informal group chats. There is no structured, searchable directory
where students can find boarding houses, dormitories, and carinderias — and no verified,
student-authored review system to help them evaluate options.

**RenTell** solves this by providing a centralized, relational-database-backed directory where
students can browse listings, read and write reviews, and save favorites. Property owners can list
and manage their own housing through a host portal. The platform facilitates discovery and visit
scheduling — actual tenancy negotiation stays face-to-face.

---

## 2. Target Users

| User type | Description |
|-----------|-------------|
| **Student (browser)** | Enrolled student looking for housing. Browses listings, reads reviews, saves favorites, books visits. Optional: identifies with student_number + course. |
| **Host (owner)** | Any user with `is_host = true`. Creates and manages housing listings, sets room availability, declares visiting hours, attaches nearby carinderias/essentials. |
| **Contributor** | Any logged-in user who adds a carinderia or essential to the shared catalog. No proprietor account required. |
| **Returning user** | Student who has settled in; contributes reviews for listings they have experienced. |

> Non-users in v1: real carinderia/shop owners (no proprietor login needed), admins, moderators.

---

## 3. Core Features

### 3.1 User Authentication

Users register and log in using their **email** and a password.

- **Register:** email, password, first_name, last_name. Optional: phone_number, student_number, course, year_level, hometown.
- **Login:** email + password → server validates, creates a `session` row, sets an HttpOnly cookie.
- **Logout:** deletes the `session` row.
- **Protected routes:** any write action (create listing, review, favorite, visit) requires an active session.
- `is_host` defaults to `false`; users toggle it from their profile to access the host portal.

### 3.2 Housing Directory (public browse)

Browse and view boarding houses, dormitories, and apartments.

- **Listing card:** name, housing_type, address, monthly_price_min–max, proximity_to_campus_km, primary image, average rating.
- **Detail page:** all housing fields + room list (room_number, room_type, capacity, available_slots, monthly_price) + amenity list + nearby carinderias (name, distance_km) + nearby essentials (name, type, distance_km) + photo gallery + all reviews.
- Publicly accessible — no login required to browse.

### 3.3 Carinderia Directory (public browse)

Browse and view carinderias / nearby eateries.

- **Listing card:** name, address, description, primary image, average rating.
- **Detail page:** all carinderia fields + photo gallery + all reviews.
- Any logged-in user can add a new carinderia to the shared catalog (`added_by` attribution).

> Essentials (laundry, pharmacy, sari-sari, church, ATM) are supplementary reference data attached to housing — **not** independently browsable in v1.

### 3.4 Host Portal

Users with `is_host = true` can create and manage their own housing listings.

- **Create housing:** fill all housing fields; becomes `owner_id` on the new row.
- **Manage rooms:** add/edit/delete rooms under a housing (room_number, room_type, capacity, available_slots, monthly_price). Owner manually updates `available_slots` as tenants move in/out off-platform.
- **Manage images:** add/remove housing and room photos (stored as URLs — no file upload infra in v1).
- **Set visiting hours:** declare availability windows per day of week (start_time, end_time).
- **Attach nearby places:** link carinderias and essentials from the shared catalog to the listing, with distance_km.
- **Manage amenities:** tag the housing with amenities from the catalog.
- Hosts only see and edit their own listings.

### 3.5 Reviews & Ratings

Authenticated users write reviews for Housing or Carinderia listings.

- **Fields:** rating (1–5 stars), comment (text), auto-set created_at.
- Reviews display: reviewer name, rating, comment, date.
- Aggregate: average rating computed via `AVG(rating)` subquery (or trigger in stretch phase).
- Users may update or delete their own reviews.

### 3.6 Favorites

Authenticated users save Housing or Carinderia listings to a personal favorites list.

- Save / unsave toggle on listing cards and detail pages.
- **Favorites page:** shows all saved listings with type badge (housing / carinderia) and date saved.
- Constraint: one user cannot save the same listing twice (UNIQUE enforced at DB level).

### 3.7 Search & Filter

Public-facing search — no login required.

- **Text search:** across housing name, address, description; carinderia name, address, description.
- **Housing filters:** housing_type, monthly_price range, proximity_to_campus_km range, amenities present, rooms with available_slots > 0.
- **Sort:** by proximity, by price, by average rating.
- Carinderia: text search only in v1.

### 3.8 Book a Visit *(stretch — Phase 9)*

Authenticated students request a visit to a housing listing.

- Student selects a date/time and submits a visit request (note optional).
- Owner confirms or declines based on declared visiting hours.
- Visit status lifecycle: `pending → confirmed | declined | cancelled`.
- Actual tenancy negotiation happens face-to-face after the visit.

---

## 4. Data Model Summary

All entities derived from `ERD/rentell.dbml`. Full DDL in `SCHEMA.md`.

### Entities (21 tables)

| Entity | PK | Key fields |
|--------|----|-----------|
| `users` | user_id (int identity) | email UNIQUE, password_hash, first_name, last_name, is_host, student_number? UNIQUE, course?, year_level?, avatar_url? |
| `session` | session_id (varchar) | user_id FK→users CASCADE, expires_at |
| `housing` | housing_id (int identity) | owner_id FK→users, name, housing_type, address, lat?, lng?, price_min/max, proximity_to_campus_km? |
| `room` | room_id (int identity) | housing_id FK CASCADE, room_type, capacity, available_slots, monthly_price |
| `carinderia` | carinderia_id (int identity) | added_by FK→users, name, address, lat?, lng? |
| `essential` | essential_id (int identity) | added_by FK→users, name, type, address |
| `amenity` | name varchar(50) (natural PK) | description |
| `housing_amenity` | (housing_id, amenity_name) | — |
| `housing_essential` | (housing_id, essential_id) | distance_km |
| `housing_carinderia` | (housing_id, carinderia_id) | distance_km |
| `housing_image` | image_id (int identity) | housing_id FK CASCADE, url, is_primary, sort_order |
| `room_image` | image_id (int identity) | room_id FK CASCADE, url, is_primary |
| `carinderia_image` | image_id (int identity) | carinderia_id FK CASCADE, url, is_primary |
| `review` | review_id (int identity) | reviewer_id FK→users, listing_type, housing_id? FK, carinderia_id? FK, rating, comment |
| `favorite` | favorite_id (int identity) | user_id FK→users, listing_type, housing_id? FK, carinderia_id? FK |
| `visit` | visit_id (int identity) | visitor_id FK→users, housing_id FK, scheduled_at, status, note? |
| `housing_visiting_hours` | id (int identity) | housing_id FK CASCADE, day_of_week, start_time, end_time |
| `conversation` *(deferred)* | conversation_id | user_one_id FK, user_two_id FK, housing_id? FK |
| `message` *(deferred)* | message_id | conversation_id FK CASCADE, sender_id FK, body, read_at? |

---

## 5. DB-Level Constraints (CMSC 127 depth)

All enforced in DDL — not just application code. Full list in `SCHEMA.md` constraint index.

| Constraint | Table | Expression |
|-----------|-------|------------|
| Rating range | review | `CHECK (rating BETWEEN 1 AND 5)` |
| listing_type values | review, favorite | `CHECK (listing_type IN ('housing', 'carinderia'))` |
| Polymorphic XOR | review, favorite | Exactly one of housing_id / carinderia_id is non-null, matching listing_type |
| No duplicate favorites | favorite | `UNIQUE (user_id, listing_type, housing_id, carinderia_id)` |
| Slot range | room | `CHECK (available_slots >= 0)` AND `CHECK (available_slots <= capacity)` |
| Visit status values | visit | `CHECK (status IN ('pending','confirmed','declined','cancelled'))` |
| Visiting hours day | housing_visiting_hours | `CHECK (day_of_week BETWEEN 0 AND 6)` |
| Visiting hours ordering | housing_visiting_hours | `CHECK (end_time > start_time)` |
| No dup visiting slots | housing_visiting_hours | `UNIQUE (housing_id, day_of_week, start_time)` |
| Canonical message pair | conversation | `CHECK (user_one_id < user_two_id)` |
| One thread per pair | conversation | `UNIQUE (user_one_id, user_two_id, housing_id)` |
| Composite PKs | all junction tables | compound PRIMARY KEY declarations |
| CASCADE deletes | session, room, images, review, favorite, visit, message | FK ON DELETE CASCADE where child has no value without parent |
| Auto-timestamps | all mutable tables | `DEFAULT now()` on created_at / updated_at |

### Trigger candidates *(optional showcase)*

- **Auto updated_at:** AFTER UPDATE on any mutable table → set `updated_at = now()`.
- **Average rating:** AFTER INSERT/UPDATE/DELETE on `review` → recompute `AVG(rating)` on the parent housing or carinderia (requires adding `avg_rating NUMERIC(3,2)` column — log in DECISIONS.md if implemented).

---

## 6. V1 Non-Goals

| Non-goal | Reason |
|----------|--------|
| Real file upload for images | Requires object storage (S3/Supabase Storage) — out of 5-day scope. Hosts enter image URLs manually in v1. |
| Real proprietor accounts for carinderias | Contributor model (`added_by`) is sufficient. Real owners have no incentive to register. |
| Messaging UI | Schema designed and in DB; UI implementation is a named stretch phase. |
| Admin / moderation panel | No admin role in v1. |
| Email notifications | No email infra in stack. |
| Real embedded map widget | lat/lng stored; UI renders a Google Maps link (`?q=lat,lng`) only. Full embed is post-v1. |
| Server-side pagination | v1 loads all results; optimize post-submission. |
| Social features (likes, shares) | Out of course scope. |

---

## 7. Success Metrics

For CMSC 127 submission purposes:

| Metric | Target |
|--------|--------|
| All 21 ERD tables created with correct types | 100% |
| All DB-level constraints present in DDL | 100% (Section 5) |
| Auth flow end-to-end | Register → login → protected action → logout |
| Housing directory browsable | Listing + detail pages functional with rooms, images, amenities |
| Carinderia directory browsable | Listing + detail pages functional |
| Host can create and manage a listing | Housing + rooms + images + visiting hours |
| Reviews submittable and displayed | Rating + comment visible on detail page |
| Favorites saveable and listed | Toggle works; favorites page shows saved items |
| Search returns relevant results | At least text search + one filter per listing type |
| UI polished | Consistent shadcn/ui design, no broken layouts |

---

## 8. Open Questions

| Question | Status |
|----------|--------|
| Should users be able to edit their own reviews? | Assumed yes — include in Phase 5 |
| Geocoding strategy — how do owners enter lat/lng? | Manual input in v1; coordinate picker post-v1 |
| `listing_type` normalization if a third type is added | Deferred — current CHECK is sufficient for v1 |
| Image URLs — hosted where? | Owner enters any public URL; no storage provisioning in v1 |
