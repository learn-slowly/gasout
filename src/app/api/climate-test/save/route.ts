import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateMBTIType } from "@/lib/climateTest";
import { TestAnswer } from "@/types/climateTest";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    const { data, error } = await supabase
      .from("climate_test_responses")
      .upsert(
        {
          session_id: sessionId,
          result_type: resultType,
          answers: answers,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "session_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error saving test response:", error);
      return NextResponse.json(
        { error: "Failed to save test response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resultType,
      id: data.id,
    });
  } catch (error) {
    console.error("Error in save route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

