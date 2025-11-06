-- LNG 가스발전소 테이블 생성
CREATE TABLE IF NOT EXISTS gas_plants (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('복합발전', '열병합발전')),
  owner TEXT NOT NULL,
  plant_name TEXT NOT NULL,
  unit_number REAL,
  location TEXT,
  capacity_mw REAL NOT NULL,
  status TEXT CHECK (status IN ('운영', '건설', '계획')),
  operation_start TEXT,
  closure_planned TEXT,
  note TEXT,
  latitude REAL,
  longitude REAL,
  geocoded BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS gas_plants_type_idx ON gas_plants(type);
CREATE INDEX IF NOT EXISTS gas_plants_status_idx ON gas_plants(status);
CREATE INDEX IF NOT EXISTS gas_plants_location_idx ON gas_plants(location);
CREATE INDEX IF NOT EXISTS gas_plants_lat_lng_idx ON gas_plants(latitude, longitude);

-- Row Level Security 활성화
ALTER TABLE gas_plants ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (누구나 볼 수 있음)
DROP POLICY IF EXISTS "Gas plants are viewable by everyone" ON gas_plants;
CREATE POLICY "Gas plants are viewable by everyone"
  ON gas_plants FOR SELECT
  USING (true);

-- 인증된 사용자만 쓰기 가능
DROP POLICY IF EXISTS "Only authenticated users can insert" ON gas_plants;
CREATE POLICY "Only authenticated users can insert"
  ON gas_plants FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Only authenticated users can update" ON gas_plants;
CREATE POLICY "Only authenticated users can update"
  ON gas_plants FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_gas_plants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_gas_plants_updated_at_trigger ON gas_plants;
CREATE TRIGGER update_gas_plants_updated_at_trigger BEFORE UPDATE
  ON gas_plants FOR EACH ROW
  EXECUTE PROCEDURE update_gas_plants_updated_at();

-- 뷰 생성: 지역별 통계
CREATE OR REPLACE VIEW gas_plants_by_region AS
SELECT 
  SPLIT_PART(location, ' ', 1) as region,
  type,
  COUNT(*) as plant_count,
  SUM(capacity_mw) as total_capacity_mw,
  AVG(capacity_mw) as avg_capacity_mw
FROM gas_plants
WHERE location IS NOT NULL
GROUP BY SPLIT_PART(location, ' ', 1), type
ORDER BY total_capacity_mw DESC;

-- 뷰: 운영 상태별 통계
CREATE OR REPLACE VIEW gas_plants_by_status AS
SELECT 
  status,
  type,
  COUNT(*) as plant_count,
  SUM(capacity_mw) as total_capacity_mw
FROM gas_plants
GROUP BY status, type
ORDER BY status, type;

-- 코멘트 추가
COMMENT ON TABLE gas_plants IS '국내 LNG 가스발전소 정보 (복합발전 및 열병합발전)';
COMMENT ON COLUMN gas_plants.id IS '발전소 고유 ID';
COMMENT ON COLUMN gas_plants.type IS '발전소 유형 (복합발전/열병합발전)';
COMMENT ON COLUMN gas_plants.capacity_mw IS '설치용량 (MW)';
COMMENT ON COLUMN gas_plants.geocoded IS '정확한 좌표 여부 (true: 정확한 주소 기반, false: 지역 중심 좌표)';

