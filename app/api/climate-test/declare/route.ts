import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      region,
      phone,
      consentPrivacy,
      consentMarketing,
      testType,
      sessionId,
    } = body;

    console.log("[Declare API] Received data:", { name, email, region, sessionId, testType });

    if (!name || !email || !consentPrivacy) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    // 세션 ID로 테스트 응답 찾기
    let testResponseId = null;
    let resultType = testType || null; // URL에서 받은 type 사용
    
    if (sessionId) {
      console.log("[Declare API] Looking up test response for session:", sessionId);
      const { data, error: lookupError } = await supabase
        .from("climate_test_responses")
        .select("id, result_type")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (lookupError) {
        console.error("[Declare API] Error looking up test response:", lookupError);
      } else if (data) {
        testResponseId = data.id;
        resultType = data.result_type; // DB에서 가져온 result_type 우선 사용
        console.log("[Declare API] Found test response:", { id: testResponseId, resultType });
      } else {
        console.warn("[Declare API] No test response found for session:", sessionId);
      }
    }

    // 기후시민 선언 저장 (MBTI 결과 포함)
    console.log("[Declare API] Saving declaration with result type:", resultType);
    const { data, error } = await supabase
      .from("climate_declarations")
      .insert({
        test_response_id: testResponseId,
        session_id: sessionId || null,
        result_type: resultType, // MBTI 결과 저장
        name,
        email,
        region: region || null,
        phone: phone || null,
        consent_privacy: consentPrivacy,
        consent_marketing: consentMarketing || false,
      })
      .select()
      .single();

    if (error) {
      console.error("[Declare API] Error saving declaration:", error);
      return NextResponse.json(
        { error: "선언을 저장하는 중 오류가 발생했습니다.", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Declare API] Declaration saved successfully:", { id: data.id, resultType });
    return NextResponse.json({
      success: true,
      id: data.id,
      resultType,
    });
  } catch (error) {
    console.error("[Declare API] Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: String(error) },
      { status: 500 }
    );
  }
}
