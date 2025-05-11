/*
  # Fix discussions table RLS policies

  1. Changes
    - Drop existing INSERT policies that are causing conflicts
    - Create new INSERT policy with proper checks for authenticated users
    - Ensure user_id matches the authenticated user
    - Verify candidate_id exists in candidates table
  
  2. Security
    - Maintain RLS enabled on discussions table
    - Add proper security checks for INSERT operations
*/

-- Drop existing INSERT policies that might conflict
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'discussions' 
    AND cmd = 'INSERT'
  ) THEN
    DROP POLICY IF EXISTS "Users can insert discussions" ON discussions;
  END IF;
END $$;

-- Create new INSERT policy with proper checks
CREATE POLICY "Users can insert discussions" ON discussions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  candidate_id IN (SELECT id FROM candidates)
);