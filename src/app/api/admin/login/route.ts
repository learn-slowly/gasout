import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, ADMIN_COOKIE } from '@/lib/adminAuth';

export async function POST(request: NextRequest) {
  const { password } = await request.json().catch(() => ({}));
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expected || !secret) {
    return NextResponse.json(
      { error: '서버에 관리자 인증이 설정되지 않았습니다.' },
      { status: 500 }
    );
  }
  if (typeof password !== 'string' || password.length === 0 || password !== expected) {
    return NextResponse.json({ error: '비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }

  const token = await createSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}
