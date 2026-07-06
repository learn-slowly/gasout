import { NextRequest, NextResponse } from 'next/server';
import { getSql, buildSetClause } from '@/lib/db';

const ALLOWED = [
  'status', 'title', 'content', 'location_type',
  'si_do', 'si_gun_gu', 'eup_myeon_dong', 'power_plant_id',
];

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
      `UPDATE articles SET ${set}, updated_at = now() WHERE id = $${values.length + 1}`,
      [...values, id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('PATCH /api/admin/articles/[id] 실패:', e);
    return NextResponse.json({ error: '기사 수정에 실패했습니다.' }, { status: 500 });
  }
}
