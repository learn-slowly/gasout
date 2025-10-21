-- articles 테이블에 승인 및 위치 관련 컬럼 추가

-- 1. 승인 상태 컬럼
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- 2. 승인자 정보
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 3. 위치 정보 컬럼
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS location_type VARCHAR(20) CHECK (location_type IN ('power_plant', 'regional', 'national', NULL)),
ADD COLUMN IF NOT EXISTS power_plant_id UUID REFERENCES power_plants(id),
ADD COLUMN IF NOT EXISTS region_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 4. 기사 카테고리
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 5. 발행일 (승인일과 다를 수 있음)
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS published_date TIMESTAMPTZ;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_power_plant_id ON articles(power_plant_id);
CREATE INDEX IF NOT EXISTS idx_articles_location_type ON articles(location_type);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date);

-- RLS 정책 업데이트
-- 일반 사용자는 승인된 기사만 볼 수 있음
DROP POLICY IF EXISTS "Public can view approved articles" ON articles;
CREATE POLICY "Public can view approved articles"
ON articles FOR SELECT
USING (status = 'approved');

-- 관리자는 모든 기사를 볼 수 있음
DROP POLICY IF EXISTS "Admins can view all articles" ON articles;
CREATE POLICY "Admins can view all articles"
ON articles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

-- 관리자는 기사를 업데이트할 수 있음
DROP POLICY IF EXISTS "Admins can update articles" ON articles;
CREATE POLICY "Admins can update articles"
ON articles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  )
);

