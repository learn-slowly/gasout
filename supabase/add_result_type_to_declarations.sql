-- 기후시민 선언 테이블에 result_type 컬럼 추가
-- MBTI 결과를 선언과 함께 저장하여 유형별 통계를 볼 수 있습니다

ALTER TABLE public.climate_declarations 
ADD COLUMN IF NOT EXISTS result_type VARCHAR(4);

-- 인덱스 추가 (유형별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_declarations_result_type ON public.climate_declarations(result_type);

-- 기존 데이터에 대해 test_response_id가 있다면 result_type 업데이트
UPDATE public.climate_declarations d
SET result_type = r.result_type
FROM public.climate_test_responses r
WHERE d.test_response_id = r.id 
  AND d.result_type IS NULL;

-- 확인
SELECT 
  result_type,
  COUNT(*) as count
FROM public.climate_declarations
WHERE result_type IS NOT NULL
GROUP BY result_type
ORDER BY count DESC;

