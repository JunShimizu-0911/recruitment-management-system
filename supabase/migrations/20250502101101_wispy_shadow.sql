/*
  # Add sample candidate history records
  
  1. Changes
    - Adds sample history records for testing
    - Includes various types of changes and actions
*/

-- Insert sample history records
INSERT INTO candidate_history (candidate_id, user_id, action, changes, created_at)
SELECT 
  c.id as candidate_id,
  p.id as user_id,
  'create',
  jsonb_build_object(
    'firstName', c.first_name,
    'lastName', c.last_name,
    'email', c.email,
    'position', c.position,
    'status', 'new'
  ),
  c.created_at
FROM candidates c
CROSS JOIN (
  SELECT id FROM profiles LIMIT 1
) p
WHERE NOT EXISTS (
  SELECT 1 FROM candidate_history WHERE candidate_id = c.id
);

-- Add some status change history
INSERT INTO candidate_history (candidate_id, user_id, action, changes)
SELECT 
  c.id,
  p.id,
  'update',
  jsonb_build_object(
    'status', jsonb_build_object(
      'old', 'new',
      'new', 'reviewing'
    )
  )
FROM candidates c
CROSS JOIN (
  SELECT id FROM profiles LIMIT 1
) p
WHERE c.status = 'reviewing'
AND NOT EXISTS (
  SELECT 1 
  FROM candidate_history 
  WHERE candidate_id = c.id 
  AND changes->>'status' IS NOT NULL
);

-- Add some interview notes updates
INSERT INTO candidate_history (candidate_id, user_id, action, changes)
SELECT 
  c.id,
  p.id,
  'update',
  jsonb_build_object(
    'interviewNotes', jsonb_build_object(
      'old', '',
      'new', c.interview_notes
    )
  )
FROM candidates c
CROSS JOIN (
  SELECT id FROM profiles LIMIT 1
) p
WHERE c.interview_notes IS NOT NULL
AND c.interview_notes != ''
AND NOT EXISTS (
  SELECT 1 
  FROM candidate_history 
  WHERE candidate_id = c.id 
  AND changes->>'interviewNotes' IS NOT NULL
);