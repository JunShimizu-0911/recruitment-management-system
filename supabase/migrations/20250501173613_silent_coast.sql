/*
  # Add password field to profiles table

  1. Changes
    - Add password column to profiles table
    - Add policy to ensure users can only update their own password
*/

-- Add password column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS password text;

-- Update policies to handle password field
CREATE POLICY "Users can update own password"
ON profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());