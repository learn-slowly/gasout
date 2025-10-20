-- 관리자 사용자 계정 생성 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행하세요

-- 1. 먼저 auth.users 테이블에 사용자 생성 (실제 인증용)
-- 주의: 이 방법은 Supabase Dashboard에서 직접 사용자를 생성하는 것이 더 안전합니다

-- 2. 대신 Supabase Dashboard에서 사용자를 생성한 후, profiles 테이블 업데이트
-- Dashboard > Authentication > Users > "Add user" 클릭
-- Email: gnclimateaction@gmail.com
-- Password: 원하는 비밀번호 설정 (예: Admin123!)

-- 3. 사용자 생성 후, 해당 사용자의 ID를 profiles 테이블에 연결
-- (사용자 ID는 Dashboard에서 확인 가능)

-- 4. 임시로 테스트용 사용자 생성 (개발용)
-- 실제 운영에서는 Dashboard를 통해 생성하는 것을 권장합니다

-- 사용자 생성 (auth.users에 직접 삽입 - 주의: 이 방법은 권장되지 않음)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'gnclimateaction@gmail.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 5. profiles 테이블 업데이트
INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
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

-- 6. 결과 확인
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.role,
  p.created_at
FROM public.profiles p
WHERE p.role = 'admin';
