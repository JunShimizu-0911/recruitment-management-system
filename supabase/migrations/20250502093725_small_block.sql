/*
  # Add detailed discussions for candidates

  1. Changes
    - Add multiple detailed discussion entries for each candidate
    - Include comments from different team members
    - Add varied feedback and interview notes
*/

-- Add more detailed discussions for existing candidates
WITH hr_users AS (
  SELECT id 
  FROM profiles 
  WHERE role_id IN (
    '11111111-1111-1111-1111-111111111111', -- 人事マネージャー
    '22222222-2222-2222-2222-222222222222'  -- 人事担当者
  )
),
interviewer_users AS (
  SELECT id 
  FROM profiles 
  WHERE role_id = '33333333-3333-3333-3333-333333333333' -- 面接官
)
INSERT INTO discussions (id, candidate_id, user_id, content, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  CASE 
    WHEN comment_type = 1 THEN (SELECT id FROM hr_users LIMIT 1)
    ELSE (SELECT id FROM interviewer_users LIMIT 1)
  END,
  comment_text,
  c.created_at + (interval '1 day' * comment_order)
FROM candidates c
CROSS JOIN (
  VALUES 
    (1, 1, '書類選考を開始します。職務経歴書から、関連する技術スタックと実務経験が十分にあることを確認しました。'),
    (2, 1, 'ポートフォリオを確認しました。特にプロジェクトXでの役割と成果が印象的です。'),
    (3, 2, '一次面接を実施しました。技術的な知識は十分で、特にシステム設計の考え方が論理的でした。'),
    (4, 1, '一次面接のフィードバックを受けて、二次面接の日程調整を開始します。'),
    (5, 2, '二次面接では、特にチームワークとコミュニケーション能力の評価に重点を置きました。積極的な姿勢が印象的でした。'),
    (6, 1, 'カルチャーフィットの面でも良好な印象です。チーム開発の経験も豊富で、即戦力として期待できます。'),
    (7, 2, '技術面接では実践的な課題にも柔軟に対応し、問題解決能力の高さを確認できました。'),
    (8, 1, '最終面接の結果を踏まえて、採用可否を検討します。'),
    (9, 2, 'コードレビューの課題も提出され、コーディング規約の理解と実装の品質が確認できました。'),
    (10, 1, '入社意欲も高く、当社の理念や価値観への共感も得られました。')
  ) AS comments(comment_order, comment_type, comment_text)
WHERE c.status IN ('reviewing', 'interviewed', 'offered')
AND NOT EXISTS (
  SELECT 1 
  FROM discussions d 
  WHERE d.candidate_id = c.id 
  AND d.content = comments.comment_text
);

-- Add specific technical feedback for software engineers
INSERT INTO discussions (id, candidate_id, user_id, content, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM profiles WHERE role_id = '33333333-3333-3333-3333-333333333333' LIMIT 1),
  CASE 
    WHEN c.position = 'software-engineer' THEN 
      '技術面接での評価：
      - アルゴリズムとデータ構造の理解：良好
      - システム設計の知識：十分
      - コードの品質と保守性への意識：高い
      - 新技術への関心と学習意欲：非常に高い
      特に印象的だったのは、マイクロサービスアーキテクチャの実践経験です。'
    WHEN c.position = 'ux-designer' THEN
      'デザインレビュー：
      - ユーザー中心設計の理解：優れている
      - プロトタイピングスキル：高い
      - デザインシステムへの理解：十分
      - ユーザビリティテストの経験：豊富
      特にユーザーリサーチに基づいたデザイン改善の実績が印象的でした。'
    ELSE
      'スキルセット評価：
      - 専門分野の知識：十分
      - プロジェクト管理能力：高い
      - チームリーダーシップ：優れている
      - 問題解決能力：非常に高い
      特に前職での成果と実績が印象的でした。'
  END,
  c.created_at + interval '2 days'
FROM candidates c
WHERE c.status IN ('interviewed', 'offered', 'hired')
AND NOT EXISTS (
  SELECT 1 
  FROM discussions d 
  WHERE d.candidate_id = c.id 
  AND d.content LIKE '%技術面接での評価%'
);

-- Add final evaluation comments
INSERT INTO discussions (id, candidate_id, user_id, content, created_at)
SELECT 
  gen_random_uuid(),
  c.id,
  (SELECT id FROM profiles WHERE role_id = '11111111-1111-1111-1111-111111111111' LIMIT 1),
  CASE c.status
    WHEN 'hired' THEN 
      '最終評価：
      採用を決定しました。
      - 技術力：優れている
      - コミュニケーション能力：高い
      - チームフィット：良好
      - 成長意欲：非常に高い
      
      入社後の活躍が期待できます。'
    WHEN 'offered' THEN
      '最終面接評価：
      - 専門性：十分
      - リーダーシップ：期待できる
      - 文化適合性：良好
      
      オファー提示の方向で検討します。'
    WHEN 'rejected' THEN
      '不採用の理由：
      - 求める経験レベルとのギャップ
      - 他の候補者がより適任
      
      今後のキャリアの参考になるフィードバックを提供します。'
    ELSE ''
  END,
  c.created_at + interval '3 days'
FROM candidates c
WHERE c.status IN ('hired', 'offered', 'rejected')
AND NOT EXISTS (
  SELECT 1 
  FROM discussions d 
  WHERE d.candidate_id = c.id 
  AND d.content LIKE '%最終評価%'
);