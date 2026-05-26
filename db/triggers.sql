-- db/triggers.sql — Phase 10: Trigger Showcases
-- Run AFTER schema.sql and seed.sql against the same Neon database.
-- Safe to re-run: CREATE OR REPLACE for functions, ALTER TABLE ... IF NOT EXISTS for columns.

-- ============================================================
-- Trigger 1: Auto updated_at
-- One shared function; one BEFORE UPDATE trigger per table.
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_housing_updated_at
  BEFORE UPDATE ON housing
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_room_updated_at
  BEFORE UPDATE ON room
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_carinderia_updated_at
  BEFORE UPDATE ON carinderia
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_review_updated_at
  BEFORE UPDATE ON review
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_visit_updated_at
  BEFORE UPDATE ON visit
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- Trigger 2: Denormalized avg_rating on housing and carinderia
-- ============================================================

-- Step 1: Add the column to both tables (idempotent)
ALTER TABLE housing    ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2);
ALTER TABLE carinderia ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2);

-- Step 2: Backfill from existing review rows so the column is not null for seeded data
UPDATE housing h
SET avg_rating = (
  SELECT ROUND(AVG(rating)::numeric, 2)
  FROM review
  WHERE housing_id = h.housing_id
    AND listing_type = 'housing'
);

UPDATE carinderia c
SET avg_rating = (
  SELECT ROUND(AVG(rating)::numeric, 2)
  FROM review
  WHERE carinderia_id = c.carinderia_id
    AND listing_type = 'carinderia'
);

-- Step 3: Trigger function — fires after any INSERT, UPDATE, or DELETE on review.
-- Uses NEW for INSERT/UPDATE, OLD for DELETE, since NEW is null on DELETE.
CREATE OR REPLACE FUNCTION refresh_avg_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_housing_id    INT;
  target_carinderia_id INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_housing_id    := OLD.housing_id;
    target_carinderia_id := OLD.carinderia_id;
  ELSE
    target_housing_id    := NEW.housing_id;
    target_carinderia_id := NEW.carinderia_id;
  END IF;

  IF target_housing_id IS NOT NULL THEN
    UPDATE housing
    SET avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM review
      WHERE housing_id = target_housing_id
        AND listing_type = 'housing'
    )
    WHERE housing_id = target_housing_id;
  END IF;

  IF target_carinderia_id IS NOT NULL THEN
    UPDATE carinderia
    SET avg_rating = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM review
      WHERE carinderia_id = target_carinderia_id
        AND listing_type = 'carinderia'
    )
    WHERE carinderia_id = target_carinderia_id;
  END IF;

  -- AFTER trigger: return value is ignored for row-level triggers
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Attach the trigger to the review table
CREATE TRIGGER trg_review_avg_rating
  AFTER INSERT OR UPDATE OR DELETE ON review
  FOR EACH ROW EXECUTE FUNCTION refresh_avg_rating();
