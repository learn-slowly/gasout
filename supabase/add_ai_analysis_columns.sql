-- articles 테이블에 AI 분석 관련 컬럼 추가

-- 1. AI 관련성 점수 및 판단
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 2. AI 분석 메타데이터
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);

-- 3. 인덱스 추가 (필터링 성능 향상)
CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant);
CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score);

-- 4. 코멘트 추가
COMMENT ON COLUMN articles.ai_score IS 'AI가 판단한 관련성 점수 (0-100)';
COMMENT ON COLUMN articles.is_relevant IS 'LNG 발전소/기후위기/탄소중립 관련 여부';
COMMENT ON COLUMN articles.ai_summary IS 'AI가 생성한 기사 요약';
COMMENT ON COLUMN articles.ai_analyzed_at IS 'AI 분석 수행 시간';
COMMENT ON COLUMN articles.ai_model_version IS '사용된 AI 모델 버전';
