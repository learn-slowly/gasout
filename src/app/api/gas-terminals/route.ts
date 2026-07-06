import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sql = getSql();
  const withCoords = request.nextUrl.searchParams.get('with_coords') === '1';
  try {
    const terminals = withCoords
      ? await sql`SELECT * FROM gas_terminals
                  WHERE latitude IS NOT NULL AND longitude IS NOT NULL
                  ORDER BY terminal_name`
      : await sql`SELECT * FROM gas_terminals ORDER BY terminal_name`;
    return NextResponse.json({ terminals });
  } catch (e) {
    console.error('GET /api/gas-terminals 실패:', e);
    return NextResponse.json({ error: '터미널 조회에 실패했습니다.' }, { status: 500 });
  }
}
