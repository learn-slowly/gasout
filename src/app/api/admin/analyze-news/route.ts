
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server environment.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || "");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: GEMINI_API_KEY is missing" }, { status: 500 });
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

        // 무료 티어에서 작동하는 모델 우선순위
        // gemini-2.0-flash-lite는 무료 티어 할당량이 0이므로 제외
        const CANDIDATE_MODELS = [
            "gemini-1.5-flash",                   // Priority 1: 무료 티어에서 안정적
            "gemini-1.5-flash-latest",            // Priority 2: 최신 버전
            "gemini-1.5-pro",                     // Priority 3: Pro 모델 (할당량 적음)
            "gemini-pro",                         // Priority 4: 레거시 Pro
        ];

        for (const article of articles) {
            const prompt = `
        Analyze the following news article for its relevance to 'LNG Power Plants', 'Climate Crisis', or 'Carbon Neutrality' in South Korea.
        Title: ${article.title}
        Content (brief): ${article.content?.substring(0, 500)}...
        Respond ONLY with a JSON object in this format: { "relevance_score": number, "is_relevant": boolean, "summary": string }
      `;

            try {
                let analysis = null;
                let lastError = null;
                let successModel = "";

                for (const modelName of CANDIDATE_MODELS) {
                    try {
                        console.log(`Trying model: ${modelName} for article ${article.id}`);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();
                        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                        analysis = JSON.parse(jsonStr);
                        successModel = modelName;
                        console.log(`Success with model: ${modelName}`);
                        break;
                    } catch (e: any) {
                        console.warn(`Failed with model ${modelName}: ${e.message}`);
                        lastError = e;
                        if (e.message.includes("429") || e.message.includes("Quota")) throw e;
                    }
                }

                if (!analysis) {
                    throw new Error(`All candidate models failed. Checked: [${CANDIDATE_MODELS.join(', ')}]. Last error: ${lastError?.message}`);
                }

                const { error: updateError } = await supabase
                    .from("articles")
                    .update({
                        ai_score: analysis.relevance_score,
                        is_relevant: analysis.is_relevant,
                        ai_summary: analysis.summary
                    })
                    .eq("id", article.id);

                if (updateError) {
                    throw new Error(`Supabase update failed: ${updateError.message}`);
                } else {
                    results.push({ id: article.id, model: successModel, ...analysis });
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
