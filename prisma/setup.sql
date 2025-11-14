-- ========================================
-- Setup script for 3D Printing Platform
-- ========================================

-- Create database (run this first if database doesn't exist)
-- CREATE DATABASE 3d_printing_platform;

-- Connect to the database before running the rest
-- \c 3d_printing_platform;

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The rest of the schema will be created by Prisma migrations
-- Run: npx prisma migrate dev --name init

-- ========================================
-- Seed data (optional)
-- ========================================

-- Insert admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'admin@3dprint.com',
  '$2a$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDdWoXehVzJptJ/op0lSsvqNu/1u',
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample print partner
INSERT INTO print_partners (id, name, email, location, "supportedMaterials", "maxColors", "isActive", "createdAt", "updatedAt")
VALUES (
  uuid_generate_v4(),
  'FastPrint Inc.',
  'contact@fastprint.com',
  'New York, USA',
  ARRAY['PLA', 'ABS', 'PETG']::text[],
  3,
  true,
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- Note: Run this after Prisma migrations are complete
-- Usage: psql -U your_user -d 3d_printing_platform -f prisma/setup.sql
