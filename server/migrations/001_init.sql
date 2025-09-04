-- Simplified initial schema for Business Case Builder (compatible with Neon)

-- Enables UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Some Postgres hosts don't support IF NOT EXISTS for CREATE TYPE
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'case_status') THEN
    CREATE TYPE case_status AS ENUM ('Active', 'Planning', 'Review');
  END IF;
END
$$;

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

-- Optional tables (kept minimal here)
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
