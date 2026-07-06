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

/**
 * 허용된 컬럼만 골라 "SET col1 = $1, col2 = $2" 조각과 파라미터 배열을 만든다.
 * body에 없는(undefined) 키는 건너뛴다. null은 명시적 초기화로 취급해 포함한다.
 */
export function buildSetClause(
  body: Record<string, unknown>,
  allowed: string[]
): { set: string; params: unknown[] } {
  const cols = allowed.filter((c) => body[c] !== undefined);
  if (cols.length === 0) return { set: '', params: [] };
  const set = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
  return { set, params: cols.map((c) => body[c]) };
}
