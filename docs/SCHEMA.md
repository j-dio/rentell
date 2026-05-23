# SCHEMA.md — Canonical Data Dictionary & DDL Intent

**Source of truth for all column names, types, and constraints.**
The authoritative ERD is `ERD/Rentell Physical ERD (3).json`.
Deviations from the ERD (schema extensions) are marked ⚠️ and logged in `DECISIONS.md`.

Do not invent columns not listed here without updating this file and `DECISIONS.md` first.

---

## Tables

### `student`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| student_number | VARCHAR(15) | PRIMARY KEY | Natural key — UP student number |
| first_name | VARCHAR(50) | NOT NULL | |
| last_name | VARCHAR(50) | NOT NULL | |
| email | VARCHAR(100) | NOT NULL | |
| course | VARCHAR(50) | | |
| year_level | INT | | |
| hometown | VARCHAR(100) | | |
| room_id | INT | FK → room(room_id) ON DELETE SET NULL | Nullable — not all students occupy a room |
| password_hash | VARCHAR(255) | NOT NULL | ⚠️ Schema extension — not in ERD. See DECISIONS.md #1 |

```sql
CREATE TABLE student (
  student_number VARCHAR(15)  PRIMARY KEY,
  first_name     VARCHAR(50)  NOT NULL,
  last_name      VARCHAR(50)  NOT NULL,
  email          VARCHAR(100) NOT NULL,
  course         VARCHAR(50),
  year_level     INT,
  hometown       VARCHAR(100),
  room_id        INT          REFERENCES room(room_id) ON DELETE SET NULL,
  password_hash  VARCHAR(255) NOT NULL
);
```

---

### `housing`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PRIMARY KEY | Surrogate key |
| name | VARCHAR(100) | NOT NULL | |
| housing_type | VARCHAR(50) | | e.g. 'boarding house', 'dormitory' |
| address | VARCHAR(200) | | |
| monthly_price_min | NUMERIC(10,2) | | |
| monthly_price_max | NUMERIC(10,2) | | |
| contact_person | VARCHAR(100) | | |
| contact_number | VARCHAR(15) | | |
| proximity_to_campus_km | NUMERIC(4,2) | | |
| description | VARCHAR(500) | | |

```sql
CREATE TABLE housing (
  housing_id              INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name                    VARCHAR(100)  NOT NULL,
  housing_type            VARCHAR(50),
  address                 VARCHAR(200),
  monthly_price_min       NUMERIC(10,2),
  monthly_price_max       NUMERIC(10,2),
  contact_person          VARCHAR(100),
  contact_number          VARCHAR(15),
  proximity_to_campus_km  NUMERIC(4,2),
  description             VARCHAR(500)
);
```

---

### `room`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| room_id | INT | PRIMARY KEY | |
| housing_id | INT | NOT NULL, FK → housing(housing_id) ON DELETE CASCADE | |
| room_number | VARCHAR(10) | | |
| room_type | VARCHAR(30) | | e.g. 'single', 'double', 'shared' |
| capacity | INT | | |
| monthly_price | NUMERIC(10,2) | | |
| is_available | BOOLEAN | DEFAULT TRUE | |

```sql
CREATE TABLE room (
  room_id        INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id     INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  room_number    VARCHAR(10),
  room_type      VARCHAR(30),
  capacity       INT,
  monthly_price  NUMERIC(10,2),
  is_available   BOOLEAN       DEFAULT TRUE
);
```

---

### `carinderia`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| carinderia_id | INT | PRIMARY KEY | |
| name | VARCHAR(100) | NOT NULL | |
| address | VARCHAR(200) | | |
| description | VARCHAR(500) | | |

```sql
CREATE TABLE carinderia (
  carinderia_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name           VARCHAR(100)  NOT NULL,
  address        VARCHAR(200),
  description    VARCHAR(500)
);
```

---

### `essential`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| essential_id | INT | PRIMARY KEY | |
| name | VARCHAR(100) | NOT NULL | |
| type | VARCHAR(50) | | e.g. 'grocery', 'pharmacy', 'laundromat', 'eatery' |
| address | VARCHAR(200) | | |
| description | VARCHAR(200) | | |

```sql
CREATE TABLE essential (
  essential_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name          VARCHAR(100)  NOT NULL,
  type          VARCHAR(50),
  address       VARCHAR(200),
  description   VARCHAR(200)
);
```

---

### `amenity`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| name | VARCHAR(50) | PRIMARY KEY | ⚠️ Natural PK — amenity name is the key. See DECISIONS.md #3 |
| description | VARCHAR(200) | | |

```sql
CREATE TABLE amenity (
  name         VARCHAR(50)   PRIMARY KEY,
  description  VARCHAR(200)
);
```

---

### `housing_essential` (junction)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK, FK → housing(housing_id) ON DELETE CASCADE | |
| essential_id | INT | PK, FK → essential(essential_id) ON DELETE CASCADE | |
| distance_km | NUMERIC(4,2) | | Walking distance from housing to this essential |

```sql
CREATE TABLE housing_essential (
  housing_id    INT           NOT NULL REFERENCES housing(housing_id)   ON DELETE CASCADE,
  essential_id  INT           NOT NULL REFERENCES essential(essential_id) ON DELETE CASCADE,
  distance_km   NUMERIC(4,2),
  PRIMARY KEY (housing_id, essential_id)
);
```

---

### `housing_amenity` (junction)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK, FK → housing(housing_id) ON DELETE CASCADE | |
| amenity_name | VARCHAR(50) | PK, FK → amenity(name) ON DELETE CASCADE | |

```sql
CREATE TABLE housing_amenity (
  housing_id    INT          NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  amenity_name  VARCHAR(50)  NOT NULL REFERENCES amenity(name)       ON DELETE CASCADE,
  PRIMARY KEY (housing_id, amenity_name)
);
```

---

### `review` *(polymorphic)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| review_id | INT | PRIMARY KEY | |
| student_number | VARCHAR(15) | NOT NULL, FK → student(student_number) ON DELETE CASCADE | |
| listing_type | VARCHAR(20) | NOT NULL, CHECK IN ('housing','carinderia') | Discriminator |
| housing_id | INT | FK → housing(housing_id) ON DELETE CASCADE, nullable | Null when listing_type = 'carinderia' |
| carinderia_id | INT | FK → carinderia(carinderia_id) ON DELETE CASCADE, nullable | Null when listing_type = 'housing' |
| rating | INT | NOT NULL, CHECK BETWEEN 1 AND 5 | |
| comment | VARCHAR(500) | | |
| date_posted | DATE | DEFAULT CURRENT_DATE | |

```sql
CREATE TABLE review (
  review_id      INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_number VARCHAR(15)   NOT NULL REFERENCES student(student_number) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)     ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  rating         INT           NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        VARCHAR(500),
  date_posted    DATE          DEFAULT CURRENT_DATE,
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  )
);
```

---

### `favorite` *(polymorphic)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| favorite_id | INT | PRIMARY KEY | |
| student_number | VARCHAR(15) | NOT NULL, FK → student(student_number) ON DELETE CASCADE | |
| listing_type | VARCHAR(20) | NOT NULL, CHECK IN ('housing','carinderia') | Discriminator |
| housing_id | INT | FK → housing(housing_id) ON DELETE CASCADE, nullable | |
| carinderia_id | INT | FK → carinderia(carinderia_id) ON DELETE CASCADE, nullable | |
| date_saved | DATE | DEFAULT CURRENT_DATE | |

```sql
CREATE TABLE favorite (
  favorite_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  student_number VARCHAR(15)   NOT NULL REFERENCES student(student_number) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  date_saved     DATE          DEFAULT CURRENT_DATE,
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  ),
  UNIQUE (student_number, listing_type, housing_id, carinderia_id)
);
```

---

### `session` *(schema extension)* ⚠️

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| session_id | VARCHAR(64) | PRIMARY KEY | Random token, signed with jose |
| student_number | VARCHAR(15) | NOT NULL, FK → student(student_number) ON DELETE CASCADE | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT NOW() | |

```sql
CREATE TABLE session (
  session_id     VARCHAR(64)   PRIMARY KEY,
  student_number VARCHAR(15)   NOT NULL REFERENCES student(student_number) ON DELETE CASCADE,
  expires_at     TIMESTAMPTZ   NOT NULL,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

## Polymorphic Tables — Quick Reference

Both `review` and `favorite` use the same XOR pattern:

| listing_type | housing_id | carinderia_id |
|-------------|-----------|--------------|
| `'housing'` | NOT NULL | NULL |
| `'carinderia'` | NULL | NOT NULL |

Any other combination is rejected by the CHECK constraint at the DB level.

---

## ERD Deviations Summary

| Deviation | Table | Decision |
|-----------|-------|---------|
| `password_hash` column added | `student` | DECISIONS.md #1 |
| `session` table (new) | new | DECISIONS.md #1 |
| `amenity` uses natural PK (`name`) | `amenity` | DECISIONS.md #3 — from ERD directly |
| `INT` with `GENERATED ALWAYS AS IDENTITY` for surrogate PKs | housing, room, carinderia, essential, review, favorite | DECISIONS.md #4 |
