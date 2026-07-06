import { NextRequest, NextResponse } from 'next/server';
import { getSql, buildSetClause } from '@/lib/db';

const ALLOWED = ['title', 'content', 'plant_id', 'youtube_url'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getSql();
  try {
    const rows = await sql`SELECT * FROM activity_posts WHERE id = ${id}`;
    if (rows.length === 0) {
      return NextResponse.json({ error: '게시물을 찾을 수 없습니다.' }, { status: 404 });
    }
    return NextResponse.json({ post: rows[0] });
  } catch (e) {
    console.error('GET /api/admin/posts/[id] 실패:', e);
    return NextResponse.json({ error: '게시물 조회에 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { set, params: values } = buildSetClause(body, ALLOWED);
  if (!set) {
    return NextResponse.json({ error: '변경할 필드가 없습니다.' }, { status: 400 });
  }
  const sql = getSql();
  try {
    await sql.query(
      `UPDATE activity_posts SET ${set}, updated_at = now() WHERE id = $${values.length + 1}`,
      [...values, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/posts/[id] 실패:', e);
    return NextResponse.json({ error: '게시물 수정에 실패했습니다.' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getSql();
  try {
    await sql`DELETE FROM activity_posts WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/admin/posts/[id] 실패:', e);
    return NextResponse.json({ error: '게시물 삭제에 실패했습니다.' }, { status: 500 });
  }
}
