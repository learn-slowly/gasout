import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Supabase Admin Client (Service Role key required for admin updates if RLS is strict, 
// but here we use the standard client assuming appropriate policies or server-side usage)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Note: Ideally use service role key for admin tasks
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST() {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
        }

        // 1. Fetch articles that haven't been analyzed yet (ai_score is null)
        const { data: articles, error: fetchError } = await supabase
            .from("articles")
            .select("id, title, content")
            .is("ai_score", null)
            .limit(10); // Process 10 at a time to avoid timeouts

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        if (!articles || articles.length === 0) {
            return NextResponse.json({ message: "No new articles to analyze" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const results = [];

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
                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                // Clean up markdown code blocks if present
                const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
                const analysis = JSON.parse(jsonStr);

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
                    console.error(`Failed to update article ${article.id}:`, updateError);
                } else {
                    results.push({ id: article.id, ...analysis });
                }
            } catch (err) {
                console.error(`Failed to analyze article ${article.id}:`, err);
                // Mark as processed but with error/0 score to prevent infinite retries if needed, 
                // or just skip. For now, we skip.
            }
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results
        });

    } catch (error: any) {
        console.error("Analysis failed:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || String(error)
        }, { status: 500 });
    }
}
