-- V33: idempotent guard — start_date was added in V12 on the cards table,
-- which was later renamed to tasks in V18. This guard targets the tasks table.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date DATE;
