# SCHEMA.md — Canonical Data Dictionary & DDL

**Source of truth for all column names, types, and constraints.**
The authoritative ERD is `ERD/rentell.dbml` (render at dbdiagram.io to view diagram).
Do not invent columns not listed here without updating this file and `DECISIONS.md` first.

---

## Tables (19 total)

### `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| user_id | INT | PK GENERATED ALWAYS AS IDENTITY | Surrogate key |
| email | VARCHAR(100) | NOT NULL UNIQUE | Login credential |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash |
| first_name | VARCHAR(50) | NOT NULL | |
| last_name | VARCHAR(50) | NOT NULL | |
| phone_number | VARCHAR(20) | | |
| avatar_url | TEXT | | Profile picture URL; no separate table |
| bio | TEXT | | |
| is_host | BOOLEAN | NOT NULL DEFAULT false | Unlocks owner portal |
| student_number | VARCHAR(20) | UNIQUE | Null for non-student users |
| course | VARCHAR(100) | | |
| year_level | SMALLINT | | |
| hometown | VARCHAR(100) | | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE users (
  user_id        INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email          VARCHAR(100)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  first_name     VARCHAR(50)   NOT NULL,
  last_name      VARCHAR(50)   NOT NULL,
  phone_number   VARCHAR(20),
  avatar_url     TEXT,
  bio            TEXT,
  is_host        BOOLEAN       NOT NULL DEFAULT false,
  student_number VARCHAR(20)   UNIQUE,
  course         VARCHAR(100),
  year_level     SMALLINT,
  hometown       VARCHAR(100),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `session`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| session_id | VARCHAR(64) | PK | Opaque random token (e.g. crypto.randomUUID) |
| user_id | INT | NOT NULL FK → users ON DELETE CASCADE | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE session (
  session_id  VARCHAR(64)  PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);
```

---

### `housing`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| owner_id | INT | NOT NULL FK → users | Host who listed this property |
| name | VARCHAR(100) | NOT NULL | |
| housing_type | VARCHAR(50) | NOT NULL | dormitory \| boarding_house \| apartment \| other |
| address | TEXT | NOT NULL | |
| latitude | NUMERIC(9,6) | | For map pin |
| longitude | NUMERIC(9,6) | | For map pin |
| monthly_price_min | NUMERIC(10,2) | | |
| monthly_price_max | NUMERIC(10,2) | | |
| contact_person | VARCHAR(100) | | |
| contact_number | VARCHAR(20) | | |
| proximity_to_campus_km | NUMERIC(5,2) | | |
| description | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE housing (
  housing_id              INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner_id                INT           NOT NULL REFERENCES users(user_id),
  name                    VARCHAR(100)  NOT NULL,
  housing_type            VARCHAR(50)   NOT NULL,
  address                 TEXT          NOT NULL,
  latitude                NUMERIC(9,6),
  longitude               NUMERIC(9,6),
  monthly_price_min       NUMERIC(10,2),
  monthly_price_max       NUMERIC(10,2),
  contact_person          VARCHAR(100),
  contact_number          VARCHAR(20),
  proximity_to_campus_km  NUMERIC(5,2),
  description             TEXT,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `room`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| room_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| housing_id | INT | NOT NULL FK → housing ON DELETE CASCADE | |
| room_number | VARCHAR(20) | | |
| room_type | VARCHAR(30) | NOT NULL | private \| shared \| bedspacer |
| capacity | SMALLINT | NOT NULL | Total beds/slots |
| available_slots | SMALLINT | NOT NULL | Owner-managed open slots; CHECK (0..capacity) |
| monthly_price | NUMERIC(10,2) | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

`available_slots > 0` means the room has open beds. "Available rooms" at the housing level is a derived query (`COUNT(*) WHERE available_slots > 0`), never stored.

```sql
CREATE TABLE room (
  room_id          INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id       INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  room_number      VARCHAR(20),
  room_type        VARCHAR(30)   NOT NULL,
  capacity         SMALLINT      NOT NULL,
  available_slots  SMALLINT      NOT NULL,
  monthly_price    NUMERIC(10,2) NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (available_slots >= 0),
  CHECK (available_slots <= capacity)
);
```

---

### `carinderia`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| carinderia_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| added_by | INT | NOT NULL FK → users | Contributor — not the real proprietor |
| name | VARCHAR(100) | NOT NULL | |
| address | TEXT | NOT NULL | |
| latitude | NUMERIC(9,6) | | |
| longitude | NUMERIC(9,6) | | |
| description | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

First-class entity: reviewable, favoritable, has its own image table, attachable to multiple housings.

```sql
CREATE TABLE carinderia (
  carinderia_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  added_by       INT           NOT NULL REFERENCES users(user_id),
  name           VARCHAR(100)  NOT NULL,
  address        TEXT          NOT NULL,
  latitude       NUMERIC(9,6),
  longitude      NUMERIC(9,6),
  description    TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `essential`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| essential_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| added_by | INT | NOT NULL FK → users | Contributor |
| name | VARCHAR(100) | NOT NULL | |
| type | VARCHAR(50) | NOT NULL | laundry \| pharmacy \| sari-sari \| church \| atm \| other |
| address | TEXT | NOT NULL | |
| latitude | NUMERIC(9,6) | | |
| longitude | NUMERIC(9,6) | | |
| description | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

Shared reference catalog. Not reviewable or favoritable (unlike carinderia).

```sql
CREATE TABLE essential (
  essential_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  added_by      INT           NOT NULL REFERENCES users(user_id),
  name          VARCHAR(100)  NOT NULL,
  type          VARCHAR(50)   NOT NULL,
  address       TEXT          NOT NULL,
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  description   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `amenity`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| name | VARCHAR(50) | PK | Natural key — short stable strings (WiFi, AC, Water) |
| description | TEXT | | |

```sql
CREATE TABLE amenity (
  name         VARCHAR(50)  PRIMARY KEY,
  description  TEXT
);
```

---

### `housing_amenity` (junction)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK, FK → housing ON DELETE CASCADE | |
| amenity_name | VARCHAR(50) | PK, FK → amenity ON DELETE CASCADE | |

```sql
CREATE TABLE housing_amenity (
  housing_id    INT          NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  amenity_name  VARCHAR(50)  NOT NULL REFERENCES amenity(name)       ON DELETE CASCADE,
  PRIMARY KEY (housing_id, amenity_name)
);
```

---

### `housing_essential` (junction)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK, FK → housing ON DELETE CASCADE | |
| essential_id | INT | PK, FK → essential ON DELETE CASCADE | |
| distance_km | NUMERIC(5,2) | | Walking distance estimate |

```sql
CREATE TABLE housing_essential (
  housing_id    INT           NOT NULL REFERENCES housing(housing_id)    ON DELETE CASCADE,
  essential_id  INT           NOT NULL REFERENCES essential(essential_id) ON DELETE CASCADE,
  distance_km   NUMERIC(5,2),
  PRIMARY KEY (housing_id, essential_id)
);
```

---

### `housing_carinderia` (junction)

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| housing_id | INT | PK, FK → housing ON DELETE CASCADE | |
| carinderia_id | INT | PK, FK → carinderia ON DELETE CASCADE | |
| distance_km | NUMERIC(5,2) | | Walking distance estimate |

```sql
CREATE TABLE housing_carinderia (
  housing_id     INT           NOT NULL REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           NOT NULL REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  distance_km    NUMERIC(5,2),
  PRIMARY KEY (housing_id, carinderia_id)
);
```

---

### `housing_image`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| image_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| housing_id | INT | NOT NULL FK → housing ON DELETE CASCADE | |
| url | TEXT | NOT NULL | |
| caption | VARCHAR(200) | | |
| is_primary | BOOLEAN | NOT NULL DEFAULT false | Thumbnail photo |
| sort_order | SMALLINT | NOT NULL DEFAULT 0 | Controls gallery order |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE housing_image (
  image_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id  INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  url         TEXT          NOT NULL,
  caption     VARCHAR(200),
  is_primary  BOOLEAN       NOT NULL DEFAULT false,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `room_image`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| image_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| room_id | INT | NOT NULL FK → room ON DELETE CASCADE | |
| url | TEXT | NOT NULL | |
| caption | VARCHAR(200) | | |
| is_primary | BOOLEAN | NOT NULL DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE room_image (
  image_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_id     INT           NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
  url         TEXT          NOT NULL,
  caption     VARCHAR(200),
  is_primary  BOOLEAN       NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `carinderia_image`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| image_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| carinderia_id | INT | NOT NULL FK → carinderia ON DELETE CASCADE | |
| url | TEXT | NOT NULL | |
| caption | VARCHAR(200) | | |
| is_primary | BOOLEAN | NOT NULL DEFAULT false | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE carinderia_image (
  image_id       INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  carinderia_id  INT           NOT NULL REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  url            TEXT          NOT NULL,
  caption        VARCHAR(200),
  is_primary     BOOLEAN       NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `review` *(polymorphic over housing | carinderia)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| review_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| reviewer_id | INT | NOT NULL FK → users ON DELETE CASCADE | |
| listing_type | VARCHAR(20) | NOT NULL CHECK IN ('housing','carinderia') | Discriminator |
| housing_id | INT | FK → housing ON DELETE CASCADE | NULL when listing_type = 'carinderia' |
| carinderia_id | INT | FK → carinderia ON DELETE CASCADE | NULL when listing_type = 'housing' |
| rating | SMALLINT | NOT NULL CHECK BETWEEN 1 AND 5 | |
| comment | TEXT | | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE review (
  review_id      INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  reviewer_id    INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  rating         SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  )
);
```

---

### `favorite` *(polymorphic over housing | carinderia)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| favorite_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| user_id | INT | NOT NULL FK → users ON DELETE CASCADE | |
| listing_type | VARCHAR(20) | NOT NULL CHECK IN ('housing','carinderia') | Discriminator |
| housing_id | INT | FK → housing ON DELETE CASCADE | NULL when listing_type = 'carinderia' |
| carinderia_id | INT | FK → carinderia ON DELETE CASCADE | NULL when listing_type = 'housing' |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE favorite (
  favorite_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id        INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  )
);

-- UNIQUE replaced by partial indexes (see DECISIONS.md #15):
-- PostgreSQL treats NULLs as distinct in table-level UNIQUE constraints,
-- so UNIQUE(user_id, listing_type, housing_id, carinderia_id) fails to
-- catch duplicates when the unused FK column is NULL.
CREATE UNIQUE INDEX favorite_housing_unique
  ON favorite (user_id, listing_type, housing_id)
  WHERE carinderia_id IS NULL;

CREATE UNIQUE INDEX favorite_carinderia_unique
  ON favorite (user_id, listing_type, carinderia_id)
  WHERE housing_id IS NULL;
```

---

### `visit`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| visit_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| visitor_id | INT | NOT NULL FK → users ON DELETE CASCADE | |
| housing_id | INT | NOT NULL FK → housing ON DELETE CASCADE | |
| scheduled_at | TIMESTAMPTZ | NOT NULL | Requested visit date/time |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | pending \| confirmed \| declined \| cancelled. owner → confirmed / declined; visitor → cancelled |
| note | TEXT | | Optional message from visitor |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| updated_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

```sql
CREATE TABLE visit (
  visit_id      INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  visitor_id    INT           NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
  housing_id    INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  note          TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

---

### `housing_visiting_hours`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| housing_id | INT | NOT NULL FK → housing ON DELETE CASCADE | |
| day_of_week | SMALLINT | NOT NULL CHECK BETWEEN 0 AND 6 | 0 = Sunday, 6 = Saturday |
| start_time | TIME | NOT NULL | |
| end_time | TIME | NOT NULL CHECK end_time > start_time | |

UNIQUE (housing_id, day_of_week, start_time) prevents duplicate overlapping slots.

```sql
CREATE TABLE housing_visiting_hours (
  id           INT       PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id   INT       NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  day_of_week  SMALLINT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME      NOT NULL,
  end_time     TIME      NOT NULL,
  CHECK (end_time > start_time),
  UNIQUE (housing_id, day_of_week, start_time)
);
```

---

### `conversation` *(deferred — schema only)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| conversation_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| user_one_id | INT | NOT NULL FK → users | CHECK user_one_id < user_two_id — canonical ordering |
| user_two_id | INT | NOT NULL FK → users | |
| housing_id | INT | FK → housing | Optional listing context |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |

UNIQUE (user_one_id, user_two_id, housing_id) — one thread per pair per listing context.

```sql
CREATE TABLE conversation (
  conversation_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_one_id      INT           NOT NULL REFERENCES users(user_id),
  user_two_id      INT           NOT NULL REFERENCES users(user_id),
  housing_id       INT           REFERENCES housing(housing_id),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (user_one_id < user_two_id),
  UNIQUE (user_one_id, user_two_id, housing_id)
);
```

---

### `message` *(deferred — schema only)*

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| message_id | INT | PK GENERATED ALWAYS AS IDENTITY | |
| conversation_id | INT | NOT NULL FK → conversation ON DELETE CASCADE | |
| sender_id | INT | NOT NULL FK → users | |
| body | TEXT | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL DEFAULT now() | |
| read_at | TIMESTAMPTZ | | NULL = unread |

```sql
CREATE TABLE message (
  message_id       INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  conversation_id  INT           NOT NULL REFERENCES conversation(conversation_id) ON DELETE CASCADE,
  sender_id        INT           NOT NULL REFERENCES users(user_id),
  body             TEXT          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  read_at          TIMESTAMPTZ
);
```

---

## Full DDL (creation order — respects FK dependencies)

Run this in order on Neon to initialize the schema:

```sql
-- 1. Accounts
CREATE TABLE users (
  user_id        INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email          VARCHAR(100)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  first_name     VARCHAR(50)   NOT NULL,
  last_name      VARCHAR(50)   NOT NULL,
  phone_number   VARCHAR(20),
  avatar_url     TEXT,
  bio            TEXT,
  is_host        BOOLEAN       NOT NULL DEFAULT false,
  student_number VARCHAR(20)   UNIQUE,
  course         VARCHAR(100),
  year_level     SMALLINT,
  hometown       VARCHAR(100),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE session (
  session_id  VARCHAR(64)  PRIMARY KEY,
  user_id     INT          NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ  NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- 2. Listings
CREATE TABLE housing (
  housing_id              INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  owner_id                INT           NOT NULL REFERENCES users(user_id),
  name                    VARCHAR(100)  NOT NULL,
  housing_type            VARCHAR(50)   NOT NULL,
  address                 TEXT          NOT NULL,
  latitude                NUMERIC(9,6),
  longitude               NUMERIC(9,6),
  monthly_price_min       NUMERIC(10,2),
  monthly_price_max       NUMERIC(10,2),
  contact_person          VARCHAR(100),
  contact_number          VARCHAR(20),
  proximity_to_campus_km  NUMERIC(5,2),
  description             TEXT,
  created_at              TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE room (
  room_id          INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id       INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  room_number      VARCHAR(20),
  room_type        VARCHAR(30)   NOT NULL,
  capacity         SMALLINT      NOT NULL,
  available_slots  SMALLINT      NOT NULL,
  monthly_price    NUMERIC(10,2) NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (available_slots >= 0),
  CHECK (available_slots <= capacity)
);

CREATE TABLE carinderia (
  carinderia_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  added_by       INT           NOT NULL REFERENCES users(user_id),
  name           VARCHAR(100)  NOT NULL,
  address        TEXT          NOT NULL,
  latitude       NUMERIC(9,6),
  longitude      NUMERIC(9,6),
  description    TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE essential (
  essential_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  added_by      INT           NOT NULL REFERENCES users(user_id),
  name          VARCHAR(100)  NOT NULL,
  type          VARCHAR(50)   NOT NULL,
  address       TEXT          NOT NULL,
  latitude      NUMERIC(9,6),
  longitude     NUMERIC(9,6),
  description   TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 3. Catalog
CREATE TABLE amenity (
  name         VARCHAR(50)  PRIMARY KEY,
  description  TEXT
);

-- 4. Junctions
CREATE TABLE housing_amenity (
  housing_id    INT          NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  amenity_name  VARCHAR(50)  NOT NULL REFERENCES amenity(name)       ON DELETE CASCADE,
  PRIMARY KEY (housing_id, amenity_name)
);

CREATE TABLE housing_essential (
  housing_id    INT           NOT NULL REFERENCES housing(housing_id)    ON DELETE CASCADE,
  essential_id  INT           NOT NULL REFERENCES essential(essential_id) ON DELETE CASCADE,
  distance_km   NUMERIC(5,2),
  PRIMARY KEY (housing_id, essential_id)
);

CREATE TABLE housing_carinderia (
  housing_id     INT           NOT NULL REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           NOT NULL REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  distance_km    NUMERIC(5,2),
  PRIMARY KEY (housing_id, carinderia_id)
);

-- 5. Media
CREATE TABLE housing_image (
  image_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id  INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  url         TEXT          NOT NULL,
  caption     VARCHAR(200),
  is_primary  BOOLEAN       NOT NULL DEFAULT false,
  sort_order  SMALLINT      NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE room_image (
  image_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_id     INT           NOT NULL REFERENCES room(room_id) ON DELETE CASCADE,
  url         TEXT          NOT NULL,
  caption     VARCHAR(200),
  is_primary  BOOLEAN       NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE TABLE carinderia_image (
  image_id       INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  carinderia_id  INT           NOT NULL REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  url            TEXT          NOT NULL,
  caption        VARCHAR(200),
  is_primary     BOOLEAN       NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 6. Reviews & Favorites
CREATE TABLE review (
  review_id      INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  reviewer_id    INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  rating         SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  )
);

CREATE TABLE favorite (
  favorite_id    INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id        INT           NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  listing_type   VARCHAR(20)   NOT NULL CHECK (listing_type IN ('housing', 'carinderia')),
  housing_id     INT           REFERENCES housing(housing_id)      ON DELETE CASCADE,
  carinderia_id  INT           REFERENCES carinderia(carinderia_id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (
    (listing_type = 'housing'    AND housing_id    IS NOT NULL AND carinderia_id IS NULL) OR
    (listing_type = 'carinderia' AND carinderia_id IS NOT NULL AND housing_id    IS NULL)
  ),
  UNIQUE (user_id, listing_type, housing_id, carinderia_id)
);

-- 7. Visits
CREATE TABLE housing_visiting_hours (
  id           INT       PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  housing_id   INT       NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  day_of_week  SMALLINT  NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME      NOT NULL,
  end_time     TIME      NOT NULL,
  CHECK (end_time > start_time),
  UNIQUE (housing_id, day_of_week, start_time)
);

CREATE TABLE visit (
  visit_id      INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  visitor_id    INT           NOT NULL REFERENCES users(user_id)    ON DELETE CASCADE,
  housing_id    INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  note          TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 8. Messaging (schema only — implementation deferred)
CREATE TABLE conversation (
  conversation_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_one_id      INT           NOT NULL REFERENCES users(user_id),
  user_two_id      INT           NOT NULL REFERENCES users(user_id),
  housing_id       INT           REFERENCES housing(housing_id),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (user_one_id < user_two_id),
  UNIQUE (user_one_id, user_two_id, housing_id)
);

CREATE TABLE message (
  message_id       INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  conversation_id  INT           NOT NULL REFERENCES conversation(conversation_id) ON DELETE CASCADE,
  sender_id        INT           NOT NULL REFERENCES users(user_id),
  body             TEXT          NOT NULL,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
  read_at          TIMESTAMPTZ
);
```

---

## Polymorphic Tables — Quick Reference

Both `review` and `favorite` use the same XOR pattern enforced by CHECK:

| `listing_type` | `housing_id` | `carinderia_id` |
|----------------|--------------|-----------------|
| `'housing'` | NOT NULL | NULL |
| `'carinderia'` | NULL | NOT NULL |

Any other combination is rejected at the DB level.

---

## Constraint Index

| Table | Constraint | Expression |
|-------|-----------|------------|
| room | availability range | `available_slots >= 0` AND `available_slots <= capacity` |
| review | rating range | `rating BETWEEN 1 AND 5` |
| review | XOR FK | listing_type matches the one non-null FK |
| favorite | XOR FK | listing_type matches the one non-null FK |
| favorite | no duplicates | Partial unique indexes: `favorite_housing_unique` (WHERE carinderia_id IS NULL), `favorite_carinderia_unique` (WHERE housing_id IS NULL) — see DECISIONS.md #15 |
| visit | status values | `status IN ('pending','confirmed','declined','cancelled')` |
| housing_visiting_hours | day range | `day_of_week BETWEEN 0 AND 6` |
| housing_visiting_hours | time ordering | `end_time > start_time` |
| housing_visiting_hours | no dup slots | UNIQUE (housing_id, day_of_week, start_time) |
| conversation | canonical pair | `user_one_id < user_two_id` |
| conversation | one thread | UNIQUE (user_one_id, user_two_id, housing_id) |

---

## Trigger Candidates *(optional showcase for CMSC 127)*

| Trigger | Table | Purpose |
|---------|-------|---------|
| `trg_users_updated_at` | users | Auto-touch `updated_at` on UPDATE |
| `trg_housing_updated_at` | housing | Auto-touch `updated_at` on UPDATE |
| `trg_room_updated_at` | room | Auto-touch `updated_at` on UPDATE |
| `trg_carinderia_updated_at` | carinderia | Auto-touch `updated_at` on UPDATE |
| `trg_review_updated_at` | review | Auto-touch `updated_at` on UPDATE |
| `trg_avg_rating_housing` | review | Maintain denormalized `avg_rating` on housing (if added) |
| `trg_avg_rating_carinderia` | review | Maintain denormalized `avg_rating` on carinderia (if added) |
