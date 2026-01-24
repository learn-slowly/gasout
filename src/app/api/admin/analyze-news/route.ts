
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server environment.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || "");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: Request) {
    try {
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: OPENAI_API_KEY is missing" }, { status: 500 });
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Check Vercel Env Vars." }, { status: 500 });
        }

        // 요청 body에서 articleId 확인
        let targetArticleId: string | null = null;
        try {
            const body = await request.json();
            targetArticleId = body.articleId || null;
        } catch {
            // body가 없으면 null로 처리
        }

        let query = supabase
            .from("articles")
            .select("id, title, content")
            .is("ai_score", null);

        if (targetArticleId) {
            // 특정 기사 분석
            query = query.eq("id", targetArticleId);
        } else {
            // 일반 분석 (1개만)
            query = query.limit(1);
        }

        const { data: articles, error: fetchError } = await query;

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            const { count: total } = await supabase.from("articles").select("*", { count: 'exact', head: true });
            const { count: pending } = await supabase.from("articles").select("*", { count: 'exact', head: true }).is("ai_score", null);
            return NextResponse.json({
                message: "No new articles to analyze",
                debug_info: { total, pending }
            });
        }

        const results = [];
        const errors = [];

        for (const article of articles) {
            const prompt = `다음 뉴스 기사를 분석하여 한국의 'LNG 발전소', '기후위기', '탄소중립'과의 관련성을 평가해주세요.

제목: ${article.title}
내용: ${article.content?.substring(0, 500)}...

다음 JSON 형식으로만 응답해주세요:
{
  "relevance_score": 0-100 사이의 숫자 (관련성 점수),
  "is_relevant": true 또는 false (70점 이상이면 true),
  "summary": "한국어로 1-2문장 요약"
}`;

            try {
                console.log(`Analyzing article ${article.id} with OpenAI GPT-4o-mini`);
                
                const completion = await openai.chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "당신은 한국의 에너지 및 기후 정책 전문가입니다. 뉴스 기사를 분석하여 LNG 발전소, 기후위기, 탄소중립과의 관련성을 평가합니다."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    response_format: { type: "json_object" }
                });

                const responseText = completion.choices[0].message.content || "{}";
                const analysis = JSON.parse(responseText);

                console.log(`Successfully analyzed article ${article.id}`);

                const { error: updateError } = await supabase
                    .from("articles")
                    .update({
                        ai_score: analysis.relevance_score,
                        is_relevant: analysis.is_relevant,
                        ai_summary: analysis.summary,
                        ai_analyzed_at: new Date().toISOString(),
                        ai_model_version: "gpt-4o-mini"
                    })
                    .eq("id", article.id);

                if (updateError) {
                    throw new Error(`Supabase update failed: ${updateError.message}`);
                } else {
                    results.push({ id: article.id, model: "gpt-4o-mini", ...analysis });
                }
            } catch (err: any) {
                console.error(`Failed to analyze article ${article.id}:`, err);
                errors.push({ id: article.id, title: article.title, error: err.message || String(err) });
            }
        }

        return NextResponse.json({
            success: results.length > 0,
            processed: results.length,
            failed: errors.length,
            results,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error("Analysis failed:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
