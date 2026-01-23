-- 거부된 기사를 30일 후 자동 삭제하는 함수
CREATE OR REPLACE FUNCTION delete_old_rejected_articles()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM articles
  WHERE status = 'rejected'
    AND updated_at < NOW() - INTERVAL '30 days';
END;
$$;

-- 매일 자동으로 실행되는 크론 작업 설정 (pg_cron 확장 필요)
-- Supabase에서는 pg_cron을 지원하지 않을 수 있으므로, 
-- 대신 Edge Function이나 외부 크론 서비스를 사용해야 합니다.

-- 수동 실행 방법:
-- SELECT delete_old_rejected_articles();

COMMENT ON FUNCTION delete_old_rejected_articles() IS '거부된 지 30일이 지난 기사를 자동으로 삭제합니다';
