-- Add specialisation column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS specialisation VARCHAR(255) NOT NULL DEFAULT 'Doctor' AFTER contact;

-- Verify the column was added
SHOW CREATE TABLE users;
DESCRIBE users;
