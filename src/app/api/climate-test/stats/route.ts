import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resultType = searchParams.get("type");
    const sql = getSql();

    // 전체 테스트 완료자 수 / 전체 기후시민 선언자 수
    let totalTests = 0;
    let totalDeclarations = 0;
    try {
      const [row] = await sql`
        SELECT
          (SELECT count(*)::int FROM climate_test_responses) AS total_tests,
          (SELECT count(*)::int FROM climate_declarations) AS total_declarations`;
      totalTests = row?.total_tests ?? 0;
      totalDeclarations = row?.total_declarations ?? 0;
    } catch (error) {
      console.error("Error fetching total tests/declarations:", error);
    }

    // 특정 유형의 테스트 완료자 수
    let sameTypeCount = 0;
    if (resultType) {
      try {
        const [row] = await sql`
          SELECT count(*)::int AS count FROM climate_test_responses
          WHERE result_type = ${resultType}`;
        sameTypeCount = row?.count ?? 0;
      } catch (error) {
        console.error("Error fetching type count:", error);
      }
    }

    // 유형별 분포 (상위 5개)
    let topTypes: { type: string; count: number; percentage: number }[] = [];
    try {
      const [totalRow] = await sql`
        SELECT count(*)::int AS count FROM climate_test_responses WHERE result_type IS NOT NULL`;
      const total = totalRow?.count ?? 0;

      const distribution = await sql`
        SELECT result_type, count(*)::int AS count
        FROM climate_test_responses
        WHERE result_type IS NOT NULL
        GROUP BY result_type ORDER BY count DESC LIMIT 5`;

      topTypes = distribution.map((row) => ({
        type: row.result_type as string,
        count: row.count as number,
        percentage: total > 0 ? Math.round(((row.count as number) / total) * 100) : 0,
      }));
    } catch (error) {
      console.error("Error fetching type distribution:", error);
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

