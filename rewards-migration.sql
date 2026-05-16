-- =====================================================================
-- Tennessee Toss: Loyalty & Rewards Program – Full Migration
-- Run this once in the Supabase SQL Editor.
--
-- AFTER RUNNING, set your admin email so RLS admin policies work:
--   ALTER DATABASE postgres SET "app.admin_email" = 'your-admin@email.com';
--   SELECT pg_reload_conf();
-- =====================================================================

-- ── 1. PROFILES: add new columns ──────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS member_number  TEXT    UNIQUE,
  ADD COLUMN IF NOT EXISTS phone          TEXT,
  ADD COLUMN IF NOT EXISTS first_name     TEXT,
  ADD COLUMN IF NOT EXISTS last_name      TEXT,
  ADD COLUMN IF NOT EXISTS lifetime_points INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_points  INT NOT NULL DEFAULT 0;

-- Backfill current_points from legacy loyalty_points column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'loyalty_points'
  ) THEN
    UPDATE profiles
    SET current_points  = GREATEST(current_points, COALESCE(loyalty_points, 0)),
        lifetime_points = GREATEST(lifetime_points, COALESCE(loyalty_points, 0))
    WHERE current_points = 0 AND COALESCE(loyalty_points, 0) > 0;
  END IF;
END;
$$;

-- ── 2. GENERATE MEMBER NUMBER function ────────────────────────────────

CREATE OR REPLACE FUNCTION generate_member_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  candidate    TEXT;
  taken        BOOLEAN;
BEGIN
  LOOP
    candidate := 'TT-' || LPAD(FLOOR(RANDOM() * 1000000)::INT::TEXT, 6, '0');
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE member_number = candidate
    ) INTO taken;
    EXIT WHEN NOT taken;
  END LOOP;
  RETURN candidate;
END;
$$;

-- ── 3. TRIGGER: auto-assign member_number on INSERT ───────────────────

CREATE OR REPLACE FUNCTION assign_member_number_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.member_number IS NULL OR NEW.member_number = '' THEN
    NEW.member_number := generate_member_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_member_number ON profiles;
CREATE TRIGGER trg_assign_member_number
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_member_number_fn();

-- ── 4. Backfill member_number for existing profiles ───────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM profiles WHERE member_number IS NULL LOOP
    UPDATE profiles SET member_number = generate_member_number() WHERE id = r.id;
  END LOOP;
END;
$$;

-- ── 5. LOYALTY_TRANSACTIONS: ensure required columns exist ────────────

ALTER TABLE loyalty_transactions
  ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);

-- Ensure type column exists (in case table was created without it)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'loyalty_transactions' AND column_name = 'type'
  ) THEN
    ALTER TABLE loyalty_transactions ADD COLUMN type TEXT;
  END IF;
END;
$$;

-- ── 6. REDEMPTIONS table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS redemptions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id        UUID        NOT NULL REFERENCES rewards(id),
  redemption_code  TEXT        NOT NULL UNIQUE,
  points_cost      INT         NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (status IN ('pending','used','expired','cancelled')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at          TIMESTAMPTZ,
  used_by_admin    TEXT,
  order_id         UUID        REFERENCES orders(id)
);

-- ── 7. ORDERS: add reward_id column ──────────────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS reward_id UUID REFERENCES rewards(id);

-- ── 8. AWARD POINTS trigger (fires when order.status → 'completed') ──

CREATE OR REPLACE FUNCTION award_points_on_order_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pts INT;
BEGIN
  IF NEW.status = 'completed'
     AND (OLD.status IS DISTINCT FROM 'completed')
     AND NEW.user_id IS NOT NULL
  THEN
    pts := GREATEST(0, FLOOR(NEW.total_amount * 10)::INT);

    IF pts > 0 THEN
      -- Guard: only award once per order
      IF NOT EXISTS (
        SELECT 1 FROM loyalty_transactions
        WHERE order_id = NEW.id AND type = 'earned'
      ) THEN
        INSERT INTO loyalty_transactions (user_id, type, points, description, order_id)
        VALUES (NEW.user_id, 'earned', pts,
                'Points earned – order #' || LEFT(NEW.id::TEXT, 8),
                NEW.id);

        UPDATE profiles
        SET current_points  = current_points  + pts,
            lifetime_points = lifetime_points + pts
        WHERE id = NEW.user_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_points ON orders;
CREATE TRIGGER trg_award_points
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION award_points_on_order_complete();

-- ── 9. SPEND POINTS function ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION spend_points(
  p_user_id    UUID,
  p_amount     INT,
  p_description TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cur_pts INT;
BEGIN
  SELECT current_points INTO cur_pts
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF cur_pts IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF cur_pts < p_amount THEN
    RAISE EXCEPTION 'Insufficient points: have %, need %', cur_pts, p_amount;
  END IF;

  UPDATE profiles
  SET current_points = current_points - p_amount
  WHERE id = p_user_id;

  INSERT INTO loyalty_transactions (user_id, type, points, description)
  VALUES (p_user_id, 'redeemed', -p_amount, p_description);
END;
$$;

-- ── 10. IS_ADMIN helper function ──────────────────────────────────────
-- Requires: ALTER DATABASE postgres SET "app.admin_email" = 'you@email.com';

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email') = NULLIF(current_setting('app.admin_email', TRUE), ''),
    FALSE
  );
$$;

-- ── 11. RLS POLICIES ──────────────────────────────────────────────────

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"    ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin"  ON profiles;

CREATE POLICY "profiles_select_own"   ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT USING (is_admin());
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (is_admin());

-- Loyalty transactions
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lt_select_own"   ON loyalty_transactions;
DROP POLICY IF EXISTS "lt_select_admin" ON loyalty_transactions;

CREATE POLICY "lt_select_own"   ON loyalty_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "lt_select_admin" ON loyalty_transactions FOR SELECT USING (is_admin());

-- Redemptions
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redemptions_select_own"   ON redemptions;
DROP POLICY IF EXISTS "redemptions_insert_own"   ON redemptions;
DROP POLICY IF EXISTS "redemptions_select_admin" ON redemptions;
DROP POLICY IF EXISTS "redemptions_update_admin" ON redemptions;

CREATE POLICY "redemptions_select_own"   ON redemptions FOR SELECT  USING (auth.uid() = user_id);
CREATE POLICY "redemptions_insert_own"   ON redemptions FOR INSERT  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "redemptions_select_admin" ON redemptions FOR SELECT  USING (is_admin());
CREATE POLICY "redemptions_update_admin" ON redemptions FOR UPDATE  USING (is_admin());

-- Orders (admin read all)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_admin" ON orders;
CREATE POLICY "orders_select_admin" ON orders FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own"   ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own"   ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_update_admin" ON orders;
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (is_admin());

-- ── 12. INDEXES ───────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_member_number ON profiles (member_number);
CREATE INDEX IF NOT EXISTS idx_profiles_phone         ON profiles (phone);

CREATE INDEX IF NOT EXISTS idx_redemptions_user_id    ON redemptions (user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_status     ON redemptions (status);
CREATE INDEX IF NOT EXISTS idx_redemptions_code       ON redemptions (redemption_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_created    ON redemptions (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lt_user_id   ON loyalty_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_lt_created   ON loyalty_transactions (created_at DESC);

-- ── DONE ──────────────────────────────────────────────────────────────
-- Remember to run:
--   ALTER DATABASE postgres SET "app.admin_email" = 'your-admin@email.com';
--   SELECT pg_reload_conf();
