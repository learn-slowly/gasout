import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { calculateMBTIType } from "@/lib/climateTest";
import { TestAnswer } from "@/types/climateTest";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionId,
      answers,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body;

    if (!sessionId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // MBTI 유형 계산
    const resultType = calculateMBTIType(answers as TestAnswer[]);

    // 데이터베이스에 저장 (upsert로 중복 방지)
    try {
      const sql = getSql();
      const rows = await sql`
        INSERT INTO climate_test_responses
          (session_id, result_type, answers, utm_source, utm_medium, utm_campaign, completed_at)
        VALUES
          (${sessionId}, ${resultType}, ${JSON.stringify(answers)}::jsonb,
           ${utm_source || null}, ${utm_medium || null}, ${utm_campaign || null}, now())
        ON CONFLICT (session_id) DO UPDATE SET
          result_type = EXCLUDED.result_type,
          answers = EXCLUDED.answers,
          utm_source = EXCLUDED.utm_source,
          utm_medium = EXCLUDED.utm_medium,
          utm_campaign = EXCLUDED.utm_campaign,
          completed_at = now()
        RETURNING *`;
      const data = rows[0];

      return NextResponse.json({
        success: true,
        resultType,
        id: data.id,
      });
    } catch (error) {
      console.error("Error saving test response:", error);
      return NextResponse.json(
        { error: "Failed to save test response" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in save route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

