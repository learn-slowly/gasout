-- 관리자 계정 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. 관리자 프로필 생성 (실제 사용 시 이메일을 변경하세요)
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  'da3685a6-4318-4edd-94f3-89994c6205c0'::uuid,
  'gnclimateaction@gmail.com',
  '시스템 관리자',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- 2. 관리자 권한 확인을 위한 쿼리
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE role = 'admin';

-- 3. RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('profiles', 'activity_posts', 'power_plants');
