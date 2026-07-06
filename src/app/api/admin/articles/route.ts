import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sql = getSql();
  const p = request.nextUrl.searchParams;
  const limit = Math.min(Number(p.get('limit') ?? 1000) || 1000, 2000);
  const offset = Math.max(Number(p.get('offset') ?? 0) || 0, 0);
  try {
    const articles = await sql.query(
      `SELECT * FROM articles ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    return NextResponse.json({ articles });
  } catch (e) {
    console.error('GET /api/admin/articles 실패:', e);
    return NextResponse.json({ error: '기사 조회에 실패했습니다.' }, { status: 500 });
  }
}
