import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultType = searchParams.get("type");

    // 전체 테스트 완료자 수
    const { count: totalTests, error: testsError } = await supabase
      .from("climate_test_responses")
      .select("*", { count: "exact", head: true });

    if (testsError) {
      console.error("Error fetching total tests:", testsError);
    }

    // 전체 기후시민 선언자 수
    const { count: totalDeclarations, error: declarationsError } = await supabase
      .from("climate_declarations")
      .select("*", { count: "exact", head: true });

    if (declarationsError) {
      console.error("Error fetching total declarations:", declarationsError);
    }

    // 특정 유형의 테스트 완료자 수
    let sameTypeCount = 0;
    if (resultType) {
      const { count, error: typeError } = await supabase
        .from("climate_test_responses")
        .select("*", { count: "exact", head: true })
        .eq("result_type", resultType);

      if (typeError) {
        console.error("Error fetching type count:", typeError);
      } else {
        sameTypeCount = count || 0;
      }
    }

    // 유형별 분포 (상위 5개)
    const { data: typeDistribution, error: distributionError } = await supabase
      .from("climate_test_responses")
      .select("result_type")
      .not("result_type", "is", null);

    let topTypes: { type: string; count: number; percentage: number }[] = [];
    if (!distributionError && typeDistribution) {
      const typeCounts = typeDistribution.reduce((acc: Record<string, number>, row) => {
        acc[row.result_type] = (acc[row.result_type] || 0) + 1;
        return acc;
      }, {});

      const total = typeDistribution.length;
      topTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count: count as number,
          percentage: total > 0 ? Math.round(((count as number) / total) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    return NextResponse.json({
      totalTests: totalTests || 0,
      totalDeclarations: totalDeclarations || 0,
      sameTypeCount,
      sameTypePercentage:
        totalTests && totalTests > 0 && resultType
          ? Math.round((sameTypeCount / totalTests) * 100)
          : 0,
      topTypes,
    });
  } catch (error) {
    console.error("Error in stats route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

