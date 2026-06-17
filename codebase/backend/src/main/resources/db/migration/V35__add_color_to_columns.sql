-- V35: add free-form hex color field to columns (distinct from legacy headerColor token).
-- V34 is reserved for board emoji (US-1803, depends on US-1800).
ALTER TABLE columns ADD COLUMN IF NOT EXISTS color VARCHAR(20);
