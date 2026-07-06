import { describe, it, expect } from 'vitest';
import { createSessionToken, verifySessionToken, ADMIN_COOKIE } from './adminAuth';

const SECRET = 'test-secret-please-change';

describe('adminAuth', () => {
  it('쿠키 이름을 export한다', () => {
    expect(ADMIN_COOKIE).toBe('admin_session');
  });

  it('생성한 토큰은 검증을 통과한다', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, SECRET)).toBe(true);
  });

  it('토큰 형식은 <만료시각>.<서명> 이고 만료는 미래다', async () => {
    const token = await createSessionToken(SECRET);
    const [exp, sig] = token.split('.');
    expect(Number(exp)).toBeGreaterThan(Date.now());
    expect(sig).toMatch(/^[0-9a-f]{64}$/);
  });

  it('다른 시크릿으로는 검증 실패', async () => {
    const token = await createSessionToken(SECRET);
    expect(await verifySessionToken(token, 'other-secret')).toBe(false);
  });

  it('만료된 토큰은 실패', async () => {
    const token = await createSessionToken(SECRET, -1000);
    expect(await verifySessionToken(token, SECRET)).toBe(false);
  });

  it('서명 위조는 실패', async () => {
    const token = await createSessionToken(SECRET);
    const [exp] = token.split('.');
    const forged = `${Number(exp) + 9999999}.${token.split('.')[1]}`;
    expect(await verifySessionToken(forged, SECRET)).toBe(false);
  });

  it('undefined/빈 문자열/형식 오류는 실패', async () => {
    expect(await verifySessionToken(undefined, SECRET)).toBe(false);
    expect(await verifySessionToken('', SECRET)).toBe(false);
    expect(await verifySessionToken('garbage', SECRET)).toBe(false);
    expect(await verifySessionToken('123.', SECRET)).toBe(false);
  });
});
