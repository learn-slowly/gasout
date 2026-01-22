import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env.local 로드
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wjeayigcorwljpkrcqai.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY가 없습니다.');
  process.exit(1);
}

console.log('🔐 Supabase에 연결 중...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrations = [
  "ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2)",
  "ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL",
  "ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT",
  "ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ",
  "ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50)",
  "CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant)",
  "CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score)"
];

async function executeMigrations() {
  console.log('🚀 마이그레이션 시작...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [index, sql] of migrations.entries()) {
    try {
      console.log(`\n${index + 1}/${migrations.length} 실행 중:`);
      console.log(`  ${sql.substring(0, 60)}...`);
      
      // PostgreSQL 함수를 통한 실행 시도
      const { data, error } = await supabase.rpc('exec_sql', { query: sql });
      
      if (error) {
        console.log(`  ⚠️  실패: ${error.message}`);
        failCount++;
      } else {
        console.log(`  ✅ 성공`);
        successCount++;
      }
    } catch (error) {
      console.log(`  ⚠️  오류: ${error.message}`);
      failCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`완료: ${successCount}개 성공, ${failCount}개 실패`);
  console.log('='.repeat(60));
  
  if (failCount > 0) {
    console.log('\n⚠️  일부 마이그레이션이 실패했습니다.');
    console.log('📝 Supabase Dashboard에서 수동으로 실행해주세요:\n');
    console.log(`🔗 https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql\n`);
    console.log('SQL:');
    console.log('─'.repeat(60));
    migrations.forEach(sql => console.log(sql + ';'));
    console.log('─'.repeat(60));
  } else {
    console.log('\n🎉 모든 마이그레이션이 성공했습니다!');
    console.log('💡 이제 /api/admin/analyze-news를 호출하여 기사를 분석할 수 있습니다.');
  }
}

executeMigrations().catch(error => {
  console.error('\n❌ 예상치 못한 오류:', error);
  process.exit(1);
});
