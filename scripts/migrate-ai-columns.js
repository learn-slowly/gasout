#!/usr/bin/env node

/**
 * AI 분석 컬럼 추가 마이그레이션 스크립트
 * 
 * 실행 방법:
 * node scripts/migrate-ai-columns.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjeayigcorwljpkrcqai.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다.');
  console.error('   .env.local 파일에 SUPABASE_SERVICE_ROLE_KEY를 추가해주세요.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 AI 분석 컬럼 마이그레이션 시작...\n');

  // 먼저 articles 테이블이 존재하는지 확인
  console.log('1️⃣ articles 테이블 확인 중...');
  const { data: tables, error: tableError } = await supabase
    .from('articles')
    .select('id')
    .limit(1);

  if (tableError) {
    console.error('❌ articles 테이블에 접근할 수 없습니다:', tableError.message);
    console.error('\n⚠️  Supabase Dashboard에서 수동으로 SQL을 실행해주세요:');
    console.error('   https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql\n');
    printSQL();
    process.exit(1);
  }

  console.log('✅ articles 테이블 확인 완료\n');

  // Supabase는 직접 ALTER TABLE을 실행할 수 없으므로, SQL Editor에서 실행하도록 안내
  console.log('⚠️  Supabase는 클라이언트에서 직접 DDL(ALTER TABLE) 명령을 실행할 수 없습니다.');
  console.log('   아래 SQL을 Supabase Dashboard에서 실행해주세요:\n');
  console.log('📍 Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1] + '/sql\n');
  
  printSQL();
  
  console.log('\n💡 SQL을 복사해서 Supabase Dashboard의 SQL Editor에 붙여넣고 실행하세요.');
  console.log('   실행 후 /api/admin/analyze-news를 호출하여 기사 분석을 시작할 수 있습니다.\n');
}

function printSQL() {
  const sql = `-- AI 분석 컬럼 추가 마이그레이션

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
COMMENT ON COLUMN articles.ai_model_version IS '사용된 AI 모델 버전';`;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(sql);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

runMigration().catch(err => {
  console.error('❌ 예상치 못한 오류:', err);
  process.exit(1);
});
