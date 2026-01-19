
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase Admin Client (Service Role key required for admin updates if RLS is strict, 
// but here we use the standard client assuming appropriate policies or server-side usage)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Admin Route MUST use the service role key to bypass RLS. Do not fallback to Anon key.
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

        // [DEBUG] Check if the key is actually a Service Role key
        try {
            const payloadPart = process.env.SUPABASE_SERVICE_ROLE_KEY?.split('.')[1];
            if (payloadPart) {
                const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
                console.log("Key Role Debug:", payload.role);

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

        // 1. Fetch articles that haven't been analyzed yet (ai_score is null)
        const { data: articles, error: fetchError } = await supabase
            .from("articles")
            .select("id, title, content")
            .is("ai_score", null)
            .limit(1); // Process 1 at a time to strictly control rate limits (Free Tier safe)

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            // Check if there are any articles at all (debug check)
            const { count: total } = await supabase.from("articles").select("*", { count: 'exact', head: true });
            const { count: pending } = await supabase.from("articles").select("*", { count: 'exact', head: true }).is("ai_score", null);

            return NextResponse.json({
                message: "No new articles to analyze",
                debug_info: {
                    total_articles_in_db: total,
                    pending_articles: pending,
                    logic: "Fetched limit(10) where ai_score is null",
                    key_role: supabaseServiceKey ? "Present (Service Role)" : "Missing",
                    env_url: process.env.NEXT_PUBLIC_SUPABASE_URL
                }
            });
        }

        const results = [];
        const errors = [];
        // [Crtical Update] User's key fails with all 1.5 models (404). 
        // We include "gemini-pro" (v1.0) as the ultimate failsafe.
        const CANDIDATE_MODELS = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-001",
            "gemini-1.5-pro",
            "gemini-pro",       // Fallback: v1.0 Stable (Most compatible)
            "gemini-1.0-pro"    // Fallback: Explicit v1.0
        ];

        // 2. Analyze each article
        for (const article of articles) {
            const prompt = `
        Analyze the following news article for its relevance to 'LNG Power Plants', 'Climate Crisis', or 'Carbon Neutrality' in South Korea.
        
        Title: ${article.title}
        Content (brief): ${article.content?.substring(0, 500)}...

        Respond ONLY with a JSON object in this format:
        {
          "relevance_score": number (0-100),
          "is_relevant": boolean (true if score >= 40),
          "summary": "1 sentence brief summary of the relevance"
        }
      `;

            try {
                let analysis = null;
                let lastError = null;

                // Try each model until one works
                for (const modelName of CANDIDATE_MODELS) {
                    try {
                        console.log(`Trying model: ${modelName} for article ${article.id}`);
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent(prompt);
                        const response = await result.response;
                        const text = response.text();

                        // Clean up markdown code blocks if present
                        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                        analysis = JSON.parse(jsonStr);
                        console.log(`Success with model: ${modelName}`);
                        break; // Success!
                    } catch (e: any) {
                        console.warn(`Failed with model ${modelName}: ${e.message}`);
                        lastError = e;
                        // Continue to next model unless it's a rate limit
                        if (e.message.includes("429") || e.message.includes("Quota")) {
                            throw e; // Fail fast on rate limits
                        }
                    }
                }

                if (!analysis) {
                    throw lastError || new Error(`All model candidates failed. Check API Key permissions. Last error: ${lastError?.message}`);
                }

                // 3. Update Supabase
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
                    results.push({ id: article.id, ...analysis });
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
