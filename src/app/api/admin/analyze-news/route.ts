
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

export async function POST() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "Configuration Error: GEMINI_API_KEY is missing" }, { status: 500 });
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Check Vercel Env Vars." }, { status: 500 });
        }

        // [DEBUG] Diagnosing Model Access
        // 404 errors persist across all models. We will try to LIST what models are available to this key.
        let availableModels: string[] = [];
        try {
            const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
            const listResponse = await fetch(listModelsUrl);
            const listData = await listResponse.json();

            if (listData.models) {
                availableModels = listData.models.map((m: any) => m.name.replace('models/', ''));
                console.log("✅ AVAILABLE MODELS FOR THIS KEY:", availableModels);
            } else {
                console.warn("⚠️ Could not list models. Response:", listData);
            }
        } catch (listErr) {
            console.error("❌ Failed to list models:", listErr);
        }

        // [DEBUG] Check Key Role
        try {
            const payloadPart = process.env.SUPABASE_SERVICE_ROLE_KEY?.split('.')[1];
            if (payloadPart) {
                const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
                if (payload.role !== 'service_role') {
                    return NextResponse.json({
                        error: "Configuration Error: 잘못된 키가 입력되었습니다.",
                        details: `현재 입력된 SUPABASE_SERVICE_ROLE_KEY는 '${payload.role}' 권한의 키입니다. 'service_role' 키를 복사해서 넣어주세요.`
                    }, { status: 500 });
                }
            }
        } catch (e) {
            console.error("Key decode failed", e);
        }

        const { data: articles, error: fetchError } = await supabase
            .from("articles")
            .select("id, title, content")
            .is("ai_score", null)
            .limit(1);

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            const { count: total } = await supabase.from("articles").select("*", { count: 'exact', head: true });
            const { count: pending } = await supabase.from("articles").select("*", { count: 'exact', head: true }).is("ai_score", null);
            return NextResponse.json({
                message: "No new articles to analyze",
                debug_info: {
                    total, pending, availableModels // Send this to UI for debugging
                }
            });
        }

        const results = [];
        const errors = [];

        // Define Candidate Models - We will prioritize what is actually available if possible
        let CANDIDATE_MODELS = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ];

        // If we successfully listed models, try to find a match dynamically
        if (availableModels.length > 0) {
            const bestMatch = availableModels.find(m => m.includes('flash')) || availableModels.find(m => m.includes('pro'));
            if (bestMatch) {
                console.log(`Dynamic Model Selection: Prioritizing ${bestMatch}`);
                CANDIDATE_MODELS.unshift(bestMatch);
            }
        }

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
                    // Propagate the available models info in the error to verify
                    throw new Error(`All models failed. Available models for this key: [${availableModels.join(', ')}]. Last error: ${lastError?.message}`);
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
            errors: errors.length > 0 ? errors : undefined,
            debug_available_models: availableModels
        });

    } catch (error: any) {
        console.error("Analysis failed:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
