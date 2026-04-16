ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS owner VARCHAR(120);

ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;

ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS resolution_type VARCHAR(30);

ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS resolution_note VARCHAR(500);

ALTER TABLE IF EXISTS alerts
    ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;

UPDATE alerts
SET status_updated_at = COALESCE(status_updated_at, created_at, NOW())
WHERE status_updated_at IS NULL;

ALTER TABLE IF EXISTS alerts
    ALTER COLUMN status_updated_at SET NOT NULL;
