-- 기존 사용자 확인 및 관리자 권한 부여
-- Supabase SQL Editor에서 실행하세요

-- 1. 기존 사용자 확인
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'gnclimateaction@gmail.com';

-- 2. 기존 profiles 확인
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE email = 'gnclimateaction@gmail.com';

-- 3. 기존 사용자를 관리자로 업데이트
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
SELECT 
  u.id,
  u.email,
  '시스템 관리자',
  'admin',
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'gnclimateaction@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = 'admin',
  updated_at = NOW();

-- 4. 결과 확인
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at,
  p.updated_at
FROM public.profiles p
WHERE p.email = 'gnclimateaction@gmail.com';
