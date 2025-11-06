-- LNG 터미널 테이블 생성
CREATE TABLE IF NOT EXISTS gas_terminals (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'LNG터미널',
  category TEXT CHECK (category IN ('가스공사', '민간')),
  owner TEXT NOT NULL,
  terminal_name TEXT NOT NULL,
  tank_number REAL,
  location TEXT,
  capacity_kl REAL,
  capacity_mtpa REAL,
  status TEXT CHECK (status IN ('운영', '건설', '계획')),
  operation_start TEXT,
  closure_planned TEXT,
  latitude REAL,
  longitude REAL,
  geocoded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS gas_terminals_category_idx ON gas_terminals(category);
CREATE INDEX IF NOT EXISTS gas_terminals_status_idx ON gas_terminals(status);
CREATE INDEX IF NOT EXISTS gas_terminals_terminal_name_idx ON gas_terminals(terminal_name);
CREATE INDEX IF NOT EXISTS gas_terminals_location_idx ON gas_terminals(location);
CREATE INDEX IF NOT EXISTS gas_terminals_lat_lng_idx ON gas_terminals(latitude, longitude);

-- Row Level Security 활성화
ALTER TABLE gas_terminals ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
DROP POLICY IF EXISTS "Gas terminals are viewable by everyone" ON gas_terminals;
CREATE POLICY "Gas terminals are viewable by everyone"
  ON gas_terminals FOR SELECT
  USING (true);

-- 인증된 사용자만 쓰기 가능
DROP POLICY IF EXISTS "Only authenticated users can insert terminals" ON gas_terminals;
CREATE POLICY "Only authenticated users can insert terminals"
  ON gas_terminals FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update terminals" ON gas_terminals;
CREATE POLICY "Only authenticated users can update terminals"
  ON gas_terminals FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 업데이트 시간 자동 갱신 트리거
DROP TRIGGER IF EXISTS update_gas_terminals_updated_at_trigger ON gas_terminals;
CREATE TRIGGER update_gas_terminals_updated_at_trigger BEFORE UPDATE
  ON gas_terminals FOR EACH ROW
  EXECUTE PROCEDURE update_gas_plants_updated_at();

-- 뷰: 터미널 그룹별 통계
CREATE OR REPLACE VIEW gas_terminals_by_group AS
SELECT 
  terminal_name,
  category,
  owner,
  COUNT(*) as tank_count,
  SUM(capacity_kl) as total_capacity_kl,
  status
FROM gas_terminals
GROUP BY terminal_name, category, owner, status
ORDER BY total_capacity_kl DESC;

-- 통합 뷰: 발전소 + 터미널
CREATE OR REPLACE VIEW gas_facilities_all AS
SELECT 
  id,
  type,
  NULL as category,
  owner,
  plant_name as name,
  NULL as tank_number,
  location,
  capacity_mw as capacity,
  'MW' as capacity_unit,
  NULL as capacity_kl,
  status,
  operation_start,
  closure_planned,
  latitude,
  longitude,
  geocoded,
  'plant' as facility_category
FROM gas_plants
UNION ALL
SELECT 
  id,
  type,
  category,
  owner,
  terminal_name as name,
  tank_number,
  location,
  NULL as capacity,
  '만kl' as capacity_unit,
  capacity_kl,
  status,
  operation_start,
  closure_planned,
  latitude,
  longitude,
  geocoded,
  'terminal' as facility_category
FROM gas_terminals;

-- 코멘트 추가
COMMENT ON TABLE gas_terminals IS '국내 LNG 터미널 정보 (가스공사 및 민간)';
COMMENT ON COLUMN gas_terminals.category IS '터미널 분류 (가스공사/민간)';
COMMENT ON COLUMN gas_terminals.capacity_kl IS '저장용량 (만kl)';
COMMENT ON COLUMN gas_terminals.capacity_mtpa IS '생산능력 (MTPA - Million Tonnes Per Annum)';
COMMENT ON COLUMN gas_terminals.tank_number IS '저장탱크 번호';
COMMENT ON VIEW gas_facilities_all IS '발전소와 터미널 통합 뷰';

