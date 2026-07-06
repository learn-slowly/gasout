import { NextResponse } from 'next/server';
import { getSql } from '@/lib/db';

/**
 * Inoreader로부터 웹훅 요청을 받아 처리하는 API 핸들러입니다.
 * Inoreader에서 새로운 기사가 수집되면 이 API를 호출하여 데이터베이스에 저장합니다.
 */
export async function POST(req: Request) {
  console.log("--- Webhook received. Starting POST function. ---");

  try {
    // 1. 요청 본문 파싱
    console.log("1. Parsing request JSON...");
    const payload = await req.json();
    // 들어온 데이터가 너무 길 수 있으니 앞부분만 살짝 보여줍니다.
    console.log("2. JSON parsed successfully. Payload snippet:", JSON.stringify(payload).substring(0, 200));

    // 2. 데이터 변환
    // Inoreader의 데이터 형식을 우리 데이터베이스 스키마에 맞게 변환합니다.
    const items = payload.items || [];
    const articlesToInsert = items.map((item: any) => ({
      title: item.title,
      url: item.canonical?.[0]?.href || item.href || 'URL not found',
      published_at: item.published ? new Date(item.published * 1000) : new Date(),
      content: item.summary?.content || ''
    }));

    if (articlesToInsert.length === 0) {
      console.log("No items to insert. This might be a test ping. Sending OK response.");
      return new NextResponse(JSON.stringify({ status: 'ok', message: 'No items to insert' }), { status: 200 });
    }

    // 3. 데이터베이스 저장 (url이 이미 존재하면 무시)
    console.log(`3. ATTEMPTING to insert ${articlesToInsert.length} articles into the database... (If it stops here, the problem is DB connection or permissions)`);
    const sql = getSql();
    for (const a of articlesToInsert) {
      await sql`
        INSERT INTO articles (title, url, published_at, content)
        VALUES (${a.title}, ${a.url}, ${a.published_at.toISOString()}, ${a.content})
        ON CONFLICT (url) DO NOTHING`;
    }

    console.log("4. Insert operation COMPLETED.");
    console.log("5. Successfully inserted data. Sending final response.");
    return new NextResponse(JSON.stringify({ status: 'ok' }), { status: 200 });

  } catch (e: any) {
    console.error("An UNEXPECTED error occurred in the main try-catch block:", e);
    return new NextResponse(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
