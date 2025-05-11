/*
  # Fix candidate history RLS policies

  1. Changes
    - Update RLS policies for candidate_history table to properly handle insert operations
    - Add policy to ensure users can only insert history records for candidates that exist
    - Add policy to ensure user_id matches the authenticated user

  2. Security
    - Maintain RLS enabled on candidate_history table
    - Ensure proper authentication checks
    - Validate candidate existence
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Users can insert history records" ON candidate_history;

-- Create new insert policy with proper checks
CREATE POLICY "Users can insert history records" ON candidate_history
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure user_id matches the authenticated user
    auth.uid() = user_id
    AND
    -- Ensure candidate exists
    candidate_id IN (SELECT id FROM candidates)
  );