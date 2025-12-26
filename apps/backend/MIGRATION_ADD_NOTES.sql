-- Migration: Add notes field to tasks table
-- Date: 2025-12-26
-- Description: Adds a text column for notes to the tasks table to support note-taking functionality in task sheets

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS notes TEXT;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN tasks.notes IS 'Additional notes or comments about the task';
