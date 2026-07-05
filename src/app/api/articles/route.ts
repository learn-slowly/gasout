import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sql = getSql();
  const p = request.nextUrl.searchParams;

  const conditions: string[] = [`status = 'approved'`];
  const params: unknown[] = [];
  const add = (fragment: string, value: unknown) => {
    params.push(value);
    conditions.push(fragment.replace('?', `$${params.length}`));
  };

  const locationType = p.get('location_type');
  if (locationType) add('location_type = ?', locationType);

  const powerPlantId = p.get('power_plant_id');
  if (powerPlantId) add('power_plant_id = ?', powerPlantId);

  const tag = p.get('tag');
  if (tag) add('tags @> ARRAY[?]::text[]', tag);

  const since = p.get('since');
  if (since) add('published_at >= ?', since);

  const search = p.get('search');
  if (search) add('title ILIKE ?', `%${search}%`);

  if (p.get('has_coords') === '1') {
    conditions.push('latitude IS NOT NULL AND longitude IS NOT NULL');
  }

  const limit = Math.min(Number(p.get('limit') ?? 20) || 20, 100);
  const offset = Math.max(Number(p.get('offset') ?? 0) || 0, 0);
  const where = conditions.join(' AND ');

  try {
    const articles = await sql.query(
      `SELECT * FROM articles WHERE ${where}
       ORDER BY published_at DESC NULLS LAST
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    if (p.get('count') === '1') {
      const countRows = (await sql.query(
        `SELECT count(*)::int AS count FROM articles WHERE ${where}`,
        params
      )) as { count: number }[];
      return NextResponse.json({ articles, count: countRows[0].count });
    }
    return NextResponse.json({ articles });
  } catch (e) {
    console.error('GET /api/articles 실패:', e);
    return NextResponse.json({ error: '기사 조회에 실패했습니다.' }, { status: 500 });
  }
}
