import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 익명 키(Anon Key)를 가져옵니다.
// NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 브라우저에서도 접근 가능합니다.
const supabaseUrl = 'https://wjeayigcorwljpkrcqai.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZWF5aWdjb3J3bGpwa3JjcWFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1ODc5MTYsImV4cCI6MjA3NjE2MzkxNn0.grTZa9sFJeU0WV84S2Z4ZccBqQatwYEet3Fq_6BLOV8';

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  throw new Error(
    `환경 변수가 설정되지 않았습니다: ${missingVars.join(', ')}\n\n` +
    `프로젝트 루트에 .env.local 파일을 생성하고 다음 환경 변수를 추가해주세요:\n\n` +
    `NEXT_PUBLIC_SUPABASE_URL=your-supabase-url\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key\n\n` +
    `Supabase 대시보드에서 이 값들을 확인할 수 있습니다.`
  );
}

/**
 * Supabase 클라이언트 인스턴스를 생성합니다.
 * 이 인스턴스를 통해 데이터베이스 쿼리, 인증, 스토리지 등의 기능을 사용할 수 있습니다.
 * createClient 함수는 싱글톤 패턴처럼 앱 전체에서 재사용하는 것이 좋습니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


