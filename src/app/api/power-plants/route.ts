import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sql = getSql();
  const withCoords = request.nextUrl.searchParams.get('with_coords') === '1';
  try {
    const plants = withCoords
      ? await sql`SELECT * FROM power_plants
                  WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                  ORDER BY name`
      : await sql`SELECT * FROM power_plants ORDER BY name`;
    return NextResponse.json({ plants });
  } catch (e) {
    console.error('GET /api/power-plants 실패:', e);
    return NextResponse.json({ error: '발전소 조회에 실패했습니다.' }, { status: 500 });
  }
}
