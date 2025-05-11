/*
  # Insert test data

  1. Test Data
    - Adds 3 roles if they don't exist
    - Adds 10 test users with different roles
    - Adds 10 test candidates with various statuses
    - Adds test discussions for candidates
*/

-- Insert test roles if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = '人事マネージャー') THEN
    INSERT INTO roles (id, name) VALUES
      ('11111111-1111-1111-1111-111111111111', '人事マネージャー');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = '人事担当者') THEN
    INSERT INTO roles (id, name) VALUES
      ('22222222-2222-2222-2222-222222222222', '人事担当者');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM roles WHERE name = '面接官') THEN
    INSERT INTO roles (id, name) VALUES
      ('33333333-3333-3333-3333-333333333333', '面接官');
  END IF;
END $$;

-- Insert test users
INSERT INTO profiles (id, email, username, full_name, role_id) VALUES
  ('a1b2c3d4-e5f6-4321-8765-1a2b3c4d5e6f', 'yamada.taro@example.com', 'yamada.taro', '山田 太郎', '11111111-1111-1111-1111-111111111111'),
  ('b2c3d4e5-f6a7-5432-8765-2b3c4d5e6f7a', 'tanaka.hanako@example.com', 'tanaka.hanako', '田中 花子', '22222222-2222-2222-2222-222222222222'),
  ('c3d4e5f6-a7b8-6543-8765-3c4d5e6f7a8b', 'suzuki.ichiro@example.com', 'suzuki.ichiro', '鈴木 一郎', '33333333-3333-3333-3333-333333333333'),
  ('d4e5f6a7-b8c9-7654-8765-4d5e6f7a8b9c', 'sato.yuki@example.com', 'sato.yuki', '佐藤 由紀', '22222222-2222-2222-2222-222222222222'),
  ('e5f6a7b8-c9d0-8765-8765-5e6f7a8b9c0d', 'ito.kenji@example.com', 'ito.kenji', '伊藤 健二', '33333333-3333-3333-3333-333333333333'),
  ('f6a7b8c9-d0e1-9876-8765-6f7a8b9c0d1e', 'watanabe.mai@example.com', 'watanabe.mai', '渡辺 麻衣', '22222222-2222-2222-2222-222222222222'),
  ('a7b8c9d0-e1f2-0987-8765-7a8b9c0d1e2f', 'kato.shin@example.com', 'kato.shin', '加藤 真', '33333333-3333-3333-3333-333333333333'),
  ('b8c9d0e1-f2a3-1098-8765-8b9c0d1e2f3a', 'yoshida.aki@example.com', 'yoshida.aki', '吉田 明', '22222222-2222-2222-2222-222222222222'),
  ('c9d0e1f2-a3b4-2109-8765-9c0d1e2f3a4b', 'yamamoto.ryu@example.com', 'yamamoto.ryu', '山本 竜', '33333333-3333-3333-3333-333333333333'),
  ('d0e1f2a3-b4c5-3210-8765-0d1e2f3a4b5c', 'nakamura.mei@example.com', 'nakamura.mei', '中村 芽衣', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  role_id = EXCLUDED.role_id;

-- Insert test candidates
INSERT INTO candidates (
  id,
  first_name,
  last_name,
  email,
  phone,
  position,
  source,
  current_company,
  experience,
  available_date,
  preferred_time,
  interview_notes,
  status,
  created_at
) VALUES
  (gen_random_uuid(), '佐藤', '健一', 'kenichi.sato@example.com', '090-1111-2222', 'software-engineer', 'linkedin', '株式会社テックA', 5, '2025-05-15', 'morning', '技術力が高く、コミュニケーション能力も良好', 'reviewing', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), '田中', '美咲', 'misaki.tanaka@example.com', '090-2222-3333', 'ux-designer', 'indeed', '株式会社デザインB', 3, '2025-05-16', 'afternoon', 'ポートフォリオの完成度が高い', 'new', NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), '鈴木', '大輔', 'daisuke.suzuki@example.com', '090-3333-4444', 'product-manager', 'referral', '株式会社プロダクトC', 7, '2025-05-17', 'morning', 'プロジェクトマネジメントの経験が豊富', 'interviewed', NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), '高橋', '愛', 'ai.takahashi@example.com', '090-4444-5555', 'data-scientist', 'company-website', '株式会社データD', 4, '2025-05-18', 'evening', '統計学の知識が豊富', 'new', NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), '渡辺', '隆', 'takashi.watanabe@example.com', '090-5555-6666', 'software-engineer', 'linkedin', '株式会社システムE', 6, '2025-05-19', 'afternoon', 'バックエンド開発の経験が豊富', 'offered', NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), '伊藤', '春香', 'haruka.ito@example.com', '090-6666-7777', 'marketing-specialist', 'indeed', '株式会社マーケットF', 2, '2025-05-20', 'morning', 'デジタルマーケティングの実績あり', 'reviewing', NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), '山本', '誠', 'makoto.yamamoto@example.com', '090-7777-8888', 'software-engineer', 'referral', '株式会社テックG', 8, '2025-05-21', 'afternoon', 'アーキテクチャ設計の経験が豊富', 'hired', NOW() - INTERVAL '7 days'),
  (gen_random_uuid(), '中村', '優子', 'yuko.nakamura@example.com', '090-8888-9999', 'ux-designer', 'company-website', '株式会社デザインH', 5, '2025-05-22', 'evening', 'UI/UXの改善実績が印象的', 'interviewed', NOW() - INTERVAL '8 days'),
  (gen_random_uuid(), '小林', '達也', 'tatsuya.kobayashi@example.com', '090-9999-0000', 'product-manager', 'linkedin', '株式会社プロダクトI', 6, '2025-05-23', 'morning', 'アジャイル開発の経験あり', 'rejected', NOW() - INTERVAL '9 days'),
  (gen_random_uuid(), '加藤', '美穂', 'miho.kato@example.com', '090-0000-1111', 'data-scientist', 'indeed', '株式会社データJ', 3, '2025-05-24', 'afternoon', '機械学習プロジェクトの実績あり', 'new', NOW() - INTERVAL '10 days')
ON CONFLICT (email) DO NOTHING;

-- Insert test discussions
WITH inserted_candidates AS (
  SELECT id, status, created_at 
  FROM candidates 
  WHERE email IN (
    'kenichi.sato@example.com',
    'misaki.tanaka@example.com',
    'daisuke.suzuki@example.com',
    'ai.takahashi@example.com',
    'takashi.watanabe@example.com',
    'haruka.ito@example.com',
    'makoto.yamamoto@example.com',
    'yuko.nakamura@example.com',
    'tatsuya.kobayashi@example.com',
    'miho.kato@example.com'
  )
)
INSERT INTO discussions (id, candidate_id, user_id, content, created_at)
SELECT 
  gen_random_uuid(),
  c.id as candidate_id,
  p.id as user_id,
  CASE 
    WHEN c.status = 'new' THEN '書類選考を開始します。'
    WHEN c.status = 'reviewing' THEN '一次面接の候補日を調整中です。'
    WHEN c.status = 'interviewed' THEN '一次面接が完了しました。技術力は十分にあります。'
    WHEN c.status = 'offered' THEN 'オファー条件を検討中です。'
    WHEN c.status = 'hired' THEN '内定承諾されました。'
    WHEN c.status = 'rejected' THEN '他の候補者が選ばれました。'
    ELSE '選考を進めています。'
  END as content,
  c.created_at + interval '1 day' as created_at
FROM inserted_candidates c
CROSS JOIN (
  SELECT id 
  FROM profiles 
  WHERE role_id = '22222222-2222-2222-2222-222222222222'
  LIMIT 1
) p;