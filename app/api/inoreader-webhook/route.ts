import { createClient } from '@supabase/supabase-js';
import type { NextApiRequest, NextApiResponse } from 'next';

// app/api/inoreader-webhook/route.ts

// ... import 문들 ...

export async function POST(req: Request) { // App Router는 NextApiRequest 대신 Request를 씁니다.
    try {
      // 👇 이 줄을 추가! 들어온 데이터를 그대로 로그에 찍어봅니다.
      console.log("Webhook payload received:", JSON.stringify(await req.clone().json(), null, 2));
  
      const payload = await req.json();
  
      // ... 나머지 코드 ...

      
// Supabase 클라이언트 생성. 환경 변수에서 URL과 서비스 키를 가져옵니다.
// 서비스 키를 사용해야 RLS 규칙을 우회하고 서버사이드에서 안전하게 데이터를 삽입할 수 있습니다.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Inoreader가 POST 방식으로 데이터를 보내므로, POST 요청이 아니면 거부합니다.
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    // Inoreader가 보낸 데이터(payload)를 받습니다.
    const payload = req.body;

    // Inoreader는 보통 'items'라는 배열에 기사 목록을 담아 보냅니다.
    if (payload && payload.items && Array.isArray(payload.items)) {
      
      // Supabase에 저장할 형태로 데이터를 가공합니다.
      const articlesToInsert = payload.items.map(item => ({
        title: item.title,
        url: item.canonical[0].href, // 보통 canonical 링크가 원본 주소입니다.
        source: item.origin.title,
        published_at: new Date(item.published * 1000), // Inoreader는 Unix 타임스탬프(초)로 제공
        summary: item.summary.content,
      }));

      // Supabase 'articles' 테이블에 데이터를 삽입(저장)합니다.
      const { error } = await supabase.from('articles').insert(articlesToInsert);

      if (error) {
        // 데이터 삽입 중 에러가 발생하면 로그를 남기고 에러 응답을 보냅니다.
        console.error('Supabase insert error:', error);
        return res.status(500).json({ message: 'Error inserting data into Supabase', error });
      }

      // 성공적으로 처리되었음을 응답합니다.
      return res.status(200).json({ message: 'Successfully received and processed webhook' });
    } else {
      // 예상치 못한 형식의 데이터가 오면 에러 응답을 보냅니다.
      return res.status(400).json({ message: 'Invalid payload format from Inoreader' });
    }
  } catch (e) {
    // 그 외 예외 처리
    console.error('Webhook handler error:', e);
    return res.status(500).json({ message: 'An unexpected error occurred' });
  }
}
