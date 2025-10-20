-- 로그인 문제 디버깅 스크립트
-- Supabase SQL Editor에서 실행하세요

-- 1. 사용자 계정 확인
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'gnclimateaction@gmail.com';

-- 2. profiles 테이블 확인
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM public.profiles 
WHERE email = 'gnclimateaction@gmail.com';

-- 3. 이메일 확인 상태 업데이트 (필요시)
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email = 'gnclimateaction@gmail.com' 
AND email_confirmed_at IS NULL;

-- 4. 비밀번호 재설정 (새 비밀번호: Admin123!)
UPDATE auth.users 
SET encrypted_password = crypt('Admin123!', gen_salt('bf'))
WHERE email = 'gnclimateaction@gmail.com';

-- 5. 최종 확인
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'gnclimateaction@gmail.com';
