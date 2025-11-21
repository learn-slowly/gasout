import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase URL과 익명 키(Anon Key)를 가져옵니다.
// NEXT_PUBLIC_ 접두사가 붙은 환경 변수는 브라우저에서도 접근 가능합니다.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

/**
 * Supabase 클라이언트 인스턴스를 생성합니다.
 * 이 인스턴스를 통해 데이터베이스 쿼리, 인증, 스토리지 등의 기능을 사용할 수 있습니다.
 * createClient 함수는 싱글톤 패턴처럼 앱 전체에서 재사용하는 것이 좋습니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


