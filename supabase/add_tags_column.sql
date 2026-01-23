-- 기사에 태그 컬럼 추가
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN (tags);

-- 기존 기사에 자동 태그 부여 (AI 요약 기반)
UPDATE articles
SET tags = ARRAY(
  SELECT DISTINCT unnest(
    CASE
      WHEN title ILIKE '%LNG%' OR title ILIKE '%가스발전%' OR title ILIKE '%복합발전%' OR ai_summary ILIKE '%LNG%' THEN ARRAY['LNG 발전소']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%탄소중립%' OR title ILIKE '%기후위기%' OR title ILIKE '%기후변화%' OR ai_summary ILIKE '%탄소중립%' OR ai_summary ILIKE '%기후위기%' THEN ARRAY['탄소중립']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%석탄%' OR title ILIKE '%화력발전%폐지%' OR ai_summary ILIKE '%석탄화력%' THEN ARRAY['석탄화력']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%환경단체%' OR title ILIKE '%시민단체%' OR title ILIKE '%환경운동%' OR ai_summary ILIKE '%시민단체%' OR ai_summary ILIKE '%환경단체%' THEN ARRAY['시민단체']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%에너지믹스%' OR title ILIKE '%에너지정책%' OR title ILIKE '%전력수급%' OR ai_summary ILIKE '%에너지%정책%' THEN ARRAY['에너지정책']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%원전%' OR title ILIKE '%원자력%' OR ai_summary ILIKE '%원전%' THEN ARRAY['원전']
      ELSE ARRAY[]::TEXT[]
    END ||
    CASE
      WHEN title ILIKE '%재생에너지%' OR title ILIKE '%태양광%' OR title ILIKE '%풍력%' OR ai_summary ILIKE '%재생에너지%' THEN ARRAY['재생에너지']
      ELSE ARRAY[]::TEXT[]
    END
  )
)
WHERE status = 'approved' AND (tags IS NULL OR array_length(tags, 1) IS NULL);

COMMENT ON COLUMN articles.tags IS '기사 주제 태그 배열 (예: LNG 발전소, 탄소중립, 석탄화력, 시민단체, 에너지정책, 원전, 재생에너지)';
