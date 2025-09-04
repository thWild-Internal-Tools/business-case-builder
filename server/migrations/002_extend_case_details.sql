-- Extend cases with additional attributes and add tags taxonomy

-- Cases: add optional fields for category, time basis, duration, currency
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS time_basis text CHECK (time_basis IN ('Monthly', 'Quarterly')),
  ADD COLUMN IF NOT EXISTS duration_value integer CHECK (duration_value IS NULL OR duration_value >= 0),
  ADD COLUMN IF NOT EXISTS duration_unit text CHECK (duration_unit IN ('months', 'quarters')),
  ADD COLUMN IF NOT EXISTS currency_code text;

-- Tags taxonomy
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Case <-> Tag mapping
CREATE TABLE IF NOT EXISTS case_tags (
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (case_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_case_tags_case_id ON case_tags(case_id);
CREATE INDEX IF NOT EXISTS idx_case_tags_tag_id ON case_tags(tag_id);

