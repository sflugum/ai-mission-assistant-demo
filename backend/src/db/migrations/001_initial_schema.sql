CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mission_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('action_plan', 'risk', 'tool')),
    sort_order INTEGER NOT NULL,
    line_text TEXT NOT NULL
);

CREATE INDEX idx_mission_lines_mission_id ON mission_lines(mission_id);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_missions_modtime
BEFORE UPDATE ON missions
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();