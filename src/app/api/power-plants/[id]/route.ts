import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sql = getSql();
  try {
    const plants = await sql`SELECT * FROM power_plants WHERE id = ${id}`;
    if (plants.length === 0) {
      return NextResponse.json({ error: '발전소를 찾을 수 없습니다.' }, { status: 404 });
    }
    const posts = await sql`
      SELECT id, title, content, created_at, youtube_url
      FROM activity_posts WHERE plant_id = ${id}
      ORDER BY created_at DESC LIMIT 10`;
    return NextResponse.json({ plant: plants[0], posts });
  } catch (e) {
    console.error('GET /api/power-plants/[id] 실패:', e);
    return NextResponse.json({ error: '발전소 조회에 실패했습니다.' }, { status: 500 });
  }
}
