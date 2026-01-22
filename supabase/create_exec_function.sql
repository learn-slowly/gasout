-- SQL 실행을 위한 함수 생성 (먼저 이것을 Supabase Dashboard에서 실행)
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;
