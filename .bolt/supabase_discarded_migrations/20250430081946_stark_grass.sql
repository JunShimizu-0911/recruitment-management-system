/*
  # Update candidates table structure

  1. Changes
    - Split name into first_name and last_name
    - Add required fields from the form
    - Update column types to match form data
    - Ensure all necessary fields are present

  2. Security
    - Maintain existing RLS policies
    - Keep table security enabled
*/

-- Drop existing tables to recreate with correct structure
DROP TABLE IF EXISTS discussions;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS profiles;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Create candidates table with form-matching structure
CREATE TABLE candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  position text NOT NULL,
  source text,
  current_company text,
  experience integer,
  available_date text,  -- Changed to text to match form data
  preferred_time text,
  interview_notes text,
  notes text,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert candidates"
  ON candidates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update candidates"
  ON candidates
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can view all candidates"
  ON candidates
  FOR SELECT
  TO authenticated
  USING (true);

-- Create discussions table
CREATE TABLE discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all discussions"
  ON discussions
  FOR SELECT
  TO authenticated
  USING (true);