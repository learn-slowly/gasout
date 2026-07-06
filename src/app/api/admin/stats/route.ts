import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

export async function GET() {
  const sql = getSql();
  try {
    const [counts] = await sql`
      SELECT
        (SELECT count(*)::int FROM power_plants) AS "totalPlants",
        (SELECT count(*)::int FROM activity_posts) AS "totalPosts",
        (SELECT count(*)::int FROM power_plants WHERE status = '운영중') AS "operatingPlants",
        (SELECT count(*)::int FROM activity_posts
          WHERE created_at >= now() - interval '7 days') AS "recentPosts",
        (SELECT count(*)::int FROM articles WHERE status = 'pending') AS "pendingArticles"
    `;
    const recentPostList = await sql`
      SELECT ap.id, ap.title, ap.created_at, pp.name AS plant_name
      FROM activity_posts ap JOIN power_plants pp ON pp.id = ap.plant_id
      ORDER BY ap.created_at DESC LIMIT 5`;
    return NextResponse.json({ ...counts, recentPostList });
  } catch (e) {
    console.error('GET /api/admin/stats 실패:', e);
    return NextResponse.json({ error: '통계 조회에 실패했습니다.' }, { status: 500 });
  }
}
