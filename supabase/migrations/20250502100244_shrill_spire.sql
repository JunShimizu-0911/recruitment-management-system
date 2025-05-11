/*
  # Add candidate history tracking

  1. New Tables
    - `candidate_history`
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, references candidates)
      - `user_id` (uuid, references profiles)
      - `action` (text) - The type of action (create/update/delete)
      - `changes` (jsonb) - The changes made in this action
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `candidate_history` table
    - Add policies for authenticated users to read and insert history records
*/

CREATE TABLE IF NOT EXISTS candidate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  changes jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE candidate_history ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view history
CREATE POLICY "Users can view candidate history"
  ON candidate_history
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert history records
CREATE POLICY "Users can insert history records"
  ON candidate_history
  FOR INSERT
  TO authenticated
  WITH CHECK (true);