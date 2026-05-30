-- RenTell Database Schema
-- Source of truth: docs/SCHEMA.md (Full DDL section)
-- Run against Neon to initialize all 21 tables.

-- 1. Accounts
CREATE TABLE users (
  user_id        INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email          VARCHAR(100)  NOT NULL UNIQUE,
  password_hash  VARCHAR(255)  NOT NULL,
  first_name     VARCHAR(50)   NOT NULL,
  last_name      VARCHAR(50)   NOT NULL,
  phone_number              VARCHAR(20),
  avatar_url                TEXT,
  preferred_location_name   VARCHAR(255),
  preferred_location_lat    NUMERIC(9,6),
  preferred_location_lng    NUMERIC(9,6),
  onboarding_completed      BOOLEAN       NOT NULL DEFAULT false,
  is_host                   BOOLEAN       NOT NULL DEFAULT false,
  created_at                TIMESTAMPTZ   NOT NULL DEFAULT now(),
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
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 3. Catalog
CREATE TABLE amenity (
  name  VARCHAR(50)  PRIMARY KEY
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

CREATE TABLE image_blob (
  blob_id     INT          PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  data        TEXT         NOT NULL,
  mime_type   VARCHAR(50)  NOT NULL,
  size_bytes  INT          NOT NULL,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
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
  )
);

-- Partial unique indexes instead of a table-level UNIQUE constraint:
-- PostgreSQL treats NULLs as distinct in UNIQUE constraints, so
-- UNIQUE(user_id, listing_type, housing_id, carinderia_id) fails to catch
-- duplicates when the unused FK column is NULL.
CREATE UNIQUE INDEX favorite_housing_unique
  ON favorite (user_id, listing_type, housing_id)
  WHERE carinderia_id IS NULL;

CREATE UNIQUE INDEX favorite_carinderia_unique
  ON favorite (user_id, listing_type, carinderia_id)
  WHERE housing_id IS NULL;

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
  visitor_id    INT           NOT NULL REFERENCES users(user_id)     ON DELETE CASCADE,
  housing_id    INT           NOT NULL REFERENCES housing(housing_id) ON DELETE CASCADE,
  scheduled_at  TIMESTAMPTZ   NOT NULL,
  status        VARCHAR(20)   NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled')),
  note          TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 8. Messaging (schema only — implementation deferred to Phase 11)
CREATE TABLE conversation (
  conversation_id  INT           PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_one_id      INT           NOT NULL REFERENCES users(user_id),
  user_two_id      INT           NOT NULL REFERENCES users(user_id),
  housing_id       INT           REFERENCES housing(housing_id) ON DELETE CASCADE,
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
