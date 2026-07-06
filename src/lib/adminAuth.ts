/**
 * 관리자 세션 토큰: "<만료epoch밀리초>.<HMAC-SHA256 hex>"
 * Edge 미들웨어에서도 동작해야 하므로 Web Crypto API만 사용한다.
 */
export const ADMIN_COOKIE = 'admin_session';

const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7일

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createSessionToken(
  secret: string,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<string> {
  const expires = Date.now() + ttlMs;
  const sig = await hmacHex(secret, String(expires));
  return `${expires}.${sig}`;
}

export async function verifySessionToken(
  token: string | undefined,
  secret: string
): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expires = Number(expStr);
  if (!Number.isFinite(expires) || expires < Date.now()) return false;
  const expected = await hmacHex(secret, expStr);
  if (sig.length !== expected.length) return false;
  // 상수 시간 비교
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return diff === 0;
}
