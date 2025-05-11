/*
  # 採用管理システムの初期スキーマ

  1. 新規テーブル
    - `profiles`: ユーザープロファイル情報
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    
    - `candidates`: 候補者情報
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `phone` (text)
      - `position` (text)
      - `status` (text)
      - `resume_url` (text)
      - `interview_date` (timestamp)
      - `experience` (text)
      - `created_at` (timestamp)
    
    - `discussions`: 候補者に関するディスカッション
      - `id` (uuid, primary key)
      - `candidate_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `created_at` (timestamp)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 適切なポリシーを各テーブルに設定
*/

-- プロファイルテーブル
CREATE TABLE IF NOT EXISTS profiles (
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

-- 候補者テーブル
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  position text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  resume_url text,
  interview_date timestamptz,
  experience text,
  created_at timestamptz DEFAULT now()
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

-- ディスカッションテーブル
CREATE TABLE IF NOT EXISTS discussions (
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