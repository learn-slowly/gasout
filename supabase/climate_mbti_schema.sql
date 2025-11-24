-- 기후시민 MBTI 테스트 데이터베이스 스키마
-- Supabase SQL Editor에서 실행

-- 테스트 응답 테이블
CREATE TABLE IF NOT EXISTS public.climate_test_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    result_type VARCHAR(4) NOT NULL, -- ENFP, ISTJ 등
    answers JSONB NOT NULL, -- 20개 질문 응답
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    shared BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_climate_result_type ON public.climate_test_responses(result_type);
CREATE INDEX IF NOT EXISTS idx_climate_created_at ON public.climate_test_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_climate_session_id ON public.climate_test_responses(session_id);

-- 기후시민 선언 테이블
CREATE TABLE IF NOT EXISTS public.climate_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_response_id UUID REFERENCES public.climate_test_responses(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    region VARCHAR(50), -- 시/군 정보
    phone VARCHAR(20),
    consent_privacy BOOLEAN NOT NULL,
    consent_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_climate_email ON public.climate_declarations(email);
CREATE INDEX IF NOT EXISTS idx_climate_region ON public.climate_declarations(region);
CREATE INDEX IF NOT EXISTS idx_climate_test_response ON public.climate_declarations(test_response_id);

-- RLS 정책 설정
ALTER TABLE public.climate_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_declarations ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (통계용)
DROP POLICY IF EXISTS climate_test_responses_read_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_read_public ON public.climate_test_responses
    FOR SELECT
    USING (true);

-- 공개 쓰기 정책 (테스트 응답 저장)
DROP POLICY IF EXISTS climate_test_responses_insert_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_insert_public ON public.climate_test_responses
    FOR INSERT
    WITH CHECK (true);

-- 공개 업데이트 정책 (공유 상태 업데이트)
DROP POLICY IF EXISTS climate_test_responses_update_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_update_public ON public.climate_test_responses
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 기후시민 선언 공개 쓰기 정책
DROP POLICY IF EXISTS climate_declarations_insert_public ON public.climate_declarations;
CREATE POLICY climate_declarations_insert_public ON public.climate_declarations
    FOR INSERT
    WITH CHECK (true);

-- 기후시민 선언 공개 읽기 정책 (통계용, 이메일 제외)
DROP POLICY IF EXISTS climate_declarations_read_public ON public.climate_declarations;
CREATE POLICY climate_declarations_read_public ON public.climate_declarations
    FOR SELECT
    USING (true);

