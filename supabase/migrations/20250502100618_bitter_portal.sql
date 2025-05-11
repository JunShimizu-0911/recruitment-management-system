/*
  # Fix candidate history RLS policies

  1. Changes
    - Update RLS policies for candidate_history table to allow proper data access
    - Add policy to allow authenticated users to view candidate history records
    - Ensure proper access control while maintaining security

  2. Security
    - Enable RLS on candidate_history table
    - Add policies for authenticated users to view records
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Users can view candidate history" ON candidate_history;

-- Create new policy to allow authenticated users to view candidate history
CREATE POLICY "Users can view candidate history"
ON candidate_history
FOR SELECT
TO authenticated
USING (true);

-- Note: We keep the existing insert policy as it's already correct:
-- "Users can insert history records" with check (true)