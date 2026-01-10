import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

/**
 * Inoreader로부터 웹훅 요청을 받아 처리하는 API 핸들러입니다.
 * Inoreader에서 새로운 기사가 수집되면 이 API를 호출하여 Supabase 데이터베이스에 저장합니다.
 */
export async function POST(req: Request) {
  console.log("--- Webhook received. Starting POST function. ---");

  try {
    // 1. 요청 본문 파싱
    console.log("1. Parsing request JSON...");
    const payload = await req.json();
    // 들어온 데이터가 너무 길 수 있으니 앞부분만 살짝 보여줍니다.
    console.log("2. JSON parsed successfully. Payload snippet:", JSON.stringify(payload).substring(0, 200));

    // 2. Supabase 클라이언트 초기화 (Service Key 사용)
    // Service Key는 모든 RLS(Row Level Security) 정책을 우회할 수 있는 관리자 권한 키입니다.
    // 서버 사이드에서만 사용해야 하며, 절대 클라이언트에 노출되면 안 됩니다.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("CRITICAL ERROR: Supabase URL or Service Key is NOT DEFINED in environment variables.");
      // 환경 변수가 없으면 여기서 즉시 에러 응답을 보냅니다.
      return new NextResponse(JSON.stringify({ error: 'Server configuration error: Missing Supabase credentials.' }), { status: 500 });
    }
    console.log("3. Environment variables seem to be present.");

    console.log("4. Initializing Supabase client...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log("5. Supabase client initialized.");

    // 3. 데이터 변환
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

    // 4. 데이터베이스 저장
    console.log(`6. ATTEMPTING to insert ${articlesToInsert.length} articles into Supabase... (If it stops here, the problem is DB connection or permissions)`);
    const { error } = await supabase.from('articles').insert(articlesToInsert);

    // ❗❗❗ 만약 6번 로그는 찍혔는데 아래 7번 로그가 안 찍힌다면, Supabase 연결/쓰기 단계에서 멈춘 것입니다. ❗❗❗

    console.log("7. Supabase insert operation COMPLETED.");

    if (error) {
      console.error("Supabase insert returned an ERROR:", error);
      return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log("8. Successfully inserted data. Sending final response.");
    return new NextResponse(JSON.stringify({ status: 'ok' }), { status: 200 });

  } catch (e: any) {
    console.error("An UNEXPECTED error occurred in the main try-catch block:", e);
    return new NextResponse(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
