import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjeayigcorwljpkrcqai.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
  process.exit(1);
}

console.log('🔐 Supabase에 연결 중...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAndMigrate() {
  console.log('\n📦 1단계: exec_sql 함수 생성 시도...');
  
  // exec_sql 함수 생성
  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE query;
END;
$$;`;

  try {
    // REST API를 통해 직접 SQL 실행 시도
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ query: createFunctionSQL })
    });

    if (response.ok) {
      console.log('✅ exec_sql 함수 생성 성공!');
    } else {
      console.log('⚠️  exec_sql 함수를 자동으로 생성할 수 없습니다.');
    }
  } catch (error) {
    console.log('⚠️  함수 생성 실패:', error.message);
  }

  console.log('\n📝 2단계: 마이그레이션 SQL 준비...\n');
  
  const migrationSQL = `-- AI 분석 컬럼 추가 마이그레이션
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant);
CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score);`;

  console.log('📋 Supabase Dashboard에서 다음 SQL을 실행해주세요:\n');
  console.log('🔗 ' + `https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql`);
  console.log('\n' + '━'.repeat(70));
  console.log(migrationSQL);
  console.log('━'.repeat(70));
  
  console.log('\n💡 SQL을 복사해서 붙여넣고 RUN 버튼을 클릭하세요.');
  console.log('   완료 후 다음 명령으로 기사를 분석할 수 있습니다:');
  console.log('   curl -X POST http://localhost:3000/api/admin/analyze-news\n');
}

setupAndMigrate().catch(console.error);
