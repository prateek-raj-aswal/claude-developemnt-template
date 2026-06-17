-- V34 (US-1803): Add emoji column to boards for PHASE-P2 visual identifiers (FD-020).
-- VARCHAR(10) accommodates multi-byte Unicode symbols.
-- NOT NULL DEFAULT '◇' back-fills all existing boards without a separate UPDATE.

-- UP
ALTER TABLE boards ADD COLUMN emoji VARCHAR(10) NOT NULL DEFAULT '◇';

-- DOWN
-- ALTER TABLE boards DROP COLUMN emoji;
