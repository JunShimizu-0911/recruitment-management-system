/*
  # Update profiles table UUID generation

  1. Changes
    - Modify profiles table to use auto-generated UUIDs for id column
    - Add default value using gen_random_uuid()
  
  2. Security
    - Maintain existing RLS policies
*/

-- Temporarily disable RLS to allow modifications
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Add default value for id column
ALTER TABLE profiles 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;