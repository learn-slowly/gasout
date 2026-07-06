import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

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

    if (!name || !phone || !consentPrivacy) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const sql = getSql();

    // 세션 ID로 테스트 응답 찾기
    let testResponseId = null;
    let resultType = testType || null; // URL에서 받은 type 사용

    if (sessionId) {
      console.log("[Declare API] Looking up test response for session:", sessionId);
      try {
        const found = await sql`
          SELECT id, result_type FROM climate_test_responses WHERE session_id = ${sessionId}`;
        const data = found[0] ?? null;

        if (data) {
          testResponseId = data.id;
          resultType = data.result_type; // DB에서 가져온 result_type 우선 사용
          console.log("[Declare API] Found test response:", { id: testResponseId, resultType });
        } else {
          console.warn("[Declare API] No test response found for session:", sessionId);
        }
      } catch (lookupError) {
        console.error("[Declare API] Error looking up test response:", lookupError);
      }
    }

    // 기후시민 선언 저장
    console.log("[Declare API] Saving declaration with result type:", resultType);
    const insertData: Record<string, unknown> = {
      session_id: sessionId || null,
      result_type: resultType,
      name,
      email: email || null,
      region: region || null,
      phone,
      consent_privacy: consentPrivacy,
      consent_marketing: consentMarketing || false,
    };
    // FK 제약이 있으므로, test_response_id가 실제로 존재할 때만 포함
    if (testResponseId) {
      insertData.test_response_id = testResponseId;
    }

    try {
      const inserted = await sql`
        INSERT INTO climate_declarations
          (test_response_id, session_id, name, email, region, phone,
           consent_privacy, consent_marketing, result_type)
        VALUES
          (${(insertData.test_response_id as string) ?? null}, ${(insertData.session_id as string) ?? null},
           ${insertData.name as string}, ${(insertData.email as string) ?? null}, ${(insertData.region as string) ?? null},
           ${insertData.phone as string}, ${insertData.consent_privacy as boolean},
           ${(insertData.consent_marketing as boolean) ?? false}, ${(insertData.result_type as string) ?? null})
        RETURNING *`;
      const data = inserted[0];

      console.log("[Declare API] Declaration saved successfully:", { id: data.id, resultType });
      return NextResponse.json({
        success: true,
        id: data.id,
        resultType,
      });
    } catch (error) {
      console.error("[Declare API] Error saving declaration:", error);
      return NextResponse.json(
        {
          error: "선언을 저장하는 중 오류가 발생했습니다.",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Declare API] Unexpected error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다.", details: String(error) },
      { status: 500 }
    );
  }
}
