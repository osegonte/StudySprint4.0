-- StudySprint 4.0 Database Initialization
-- This script will be executed when the PostgreSQL container starts

-- Create the main database if it doesn't exist
-- Note: This is handled by POSTGRES_DB environment variable

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Additional initialization can be added here
