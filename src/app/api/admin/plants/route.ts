import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function POST(request: NextRequest) {
  const b = await request.json().catch(() => ({}));
  if (!b.name || !b.address || b.latitude == null || b.longitude == null) {
    return NextResponse.json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
  }
  const sql = getSql();
  try {
    const rows = await sql`
      INSERT INTO power_plants
        (name, address, latitude, longitude, capacity_mw, status,
         plant_type, fuel_type, operator, permit_date, description)
      VALUES
        (${b.name}, ${b.address}, ${b.latitude}, ${b.longitude},
         ${b.capacity_mw ?? null}, ${b.status ?? null}, ${b.plant_type ?? null},
         ${b.fuel_type ?? null}, ${b.operator ?? null}, ${b.permit_date ?? null},
         ${b.description ?? null})
      RETURNING *`;
    return NextResponse.json({ plant: rows[0] });
  } catch (e) {
    console.error('POST /api/admin/plants 실패:', e);
    return NextResponse.json({ error: '발전소 등록에 실패했습니다.' }, { status: 500 });
  }
}
