-- Initial schema for Business Case Builder
-- Enables UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Case status enum to align with current app states
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') THEN
    CREATE TYPE case_status AS ENUM ('Active', 'Planning', 'Review');
  END IF;
END $$;

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Cases (business cases) belong to a client
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status case_status NOT NULL DEFAULT 'Planning',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cases_client_id ON cases(client_id);

-- Cost items for a case
CREATE TABLE IF NOT EXISTS cost_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  amount numeric(14,2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cost_items_case_id ON cost_items(case_id);

-- Revenue items for a case
CREATE TABLE IF NOT EXISTS revenue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  amount numeric(14,2) NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_revenue_items_case_id ON revenue_items(case_id);

-- 0..1 Cost timing per cost item
CREATE TABLE IF NOT EXISTS cost_timing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_item_id uuid NOT NULL UNIQUE REFERENCES cost_items(id) ON DELETE CASCADE,
  start_date date,
  end_date date,
  recurrence_interval_months integer CHECK (recurrence_interval_months IS NULL OR recurrence_interval_months >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 0..1 Revenue timing per revenue item
CREATE TABLE IF NOT EXISTS revenue_timing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_item_id uuid NOT NULL UNIQUE REFERENCES revenue_items(id) ON DELETE CASCADE,
  start_date date,
  end_date date,
  recurrence_interval_months integer CHECK (recurrence_interval_months IS NULL OR recurrence_interval_months >= 0),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Global rules attached to a case (e.g., discount rates, tax, inflation)
CREATE TABLE IF NOT EXISTS global_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL,
  rule_type text, -- e.g. discount_rate, tax_rate, inflation
  value numeric(14,6),
  metadata jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_global_rules_case_id ON global_rules(case_id);

-- Goals for a case (e.g., ROI target, payback period)
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name text NOT NULL, -- e.g., ROI target
  metric text,        -- e.g., roi, npv, payback_months
  target_value numeric(14,4),
  operator text,      -- e.g., ">=", "<=", "=="
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_case_id ON goals(case_id);

-- Assumptions for a case (key/value style, with optional numeric and metadata)
CREATE TABLE IF NOT EXISTS assumptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  key_text text NOT NULL,
  value_text text,
  value_numeric numeric(14,6),
  metadata jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assumptions_case_id ON assumptions(case_id);

-- Basic trigger to keep updated_at current (optional convenience)
DO $$ BEGIN
  CREATE OR REPLACE FUNCTION set_updated_at()
  RETURNS trigger AS $$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  PERFORM 1; -- placeholder to allow multiple create trigger statements safely
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cases_updated BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cost_items_updated BEFORE UPDATE ON cost_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_revenue_items_updated BEFORE UPDATE ON revenue_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_cost_timing_updated BEFORE UPDATE ON cost_timing FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_revenue_timing_updated BEFORE UPDATE ON revenue_timing FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_global_rules_updated BEFORE UPDATE ON global_rules FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_goals_updated BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_assumptions_updated BEFORE UPDATE ON assumptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN others THEN NULL; END $$;

