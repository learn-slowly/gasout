import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET() {
  const sql = getSql();
  try {
    const posts = await sql`
      SELECT ap.id, ap.title, ap.content, ap.created_at, ap.youtube_url,
             pp.name AS plant_name
      FROM activity_posts ap JOIN power_plants pp ON pp.id = ap.plant_id
      ORDER BY ap.created_at DESC`;
    return NextResponse.json({ posts });
  } catch (e) {
    console.error('GET /api/admin/posts 실패:', e);
    return NextResponse.json({ error: '게시물 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => ({}));
  if (!b.title || !b.content || !b.plant_id) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }
  const sql = getSql();
  try {
    const rows = await sql`
      INSERT INTO activity_posts (title, content, plant_id, youtube_url)
      VALUES (${b.title}, ${b.content}, ${b.plant_id}, ${b.youtube_url ?? null})
      RETURNING *`;
    return NextResponse.json({ post: rows[0] });
  } catch (e) {
    console.error('POST /api/admin/posts 실패:', e);
    return NextResponse.json({ error: '게시물 작성에 실패했습니다.' }, { status: 500 });
  }
}
