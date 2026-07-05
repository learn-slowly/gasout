import { neon } from '@neondatabase/serverless';

type Sql = ReturnType<typeof neon>;

let _sql: Sql | null = null;

/**
 * Neon 서버리스 드라이버 싱글톤.
 * 서버 코드(API 라우트, 서버 컴포넌트)에서만 import할 것.
 */
export function getSql(): Sql {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL 환경변수가 설정되지 않았습니다.');
    }
    _sql = neon(url);
  }
  return _sql;
}
