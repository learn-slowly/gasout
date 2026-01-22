import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error("CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in server environment.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey || "");

export async function POST() {
    try {
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY) {
            return NextResponse.json({ 
                error: "Configuration Error: SUPABASE_SERVICE_ROLE_KEY is missing. Check environment variables." 
            }, { status: 500 });
        }

        console.log('🚀 Starting database migration...');

        // AI 분석 컬럼 추가
        const migrations = [
            // 1. ai_score 컬럼 추가
            {
                name: "Add ai_score column",
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2);`
            },
            // 2. is_relevant 컬럼 추가
            {
                name: "Add is_relevant column",
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL;`
            },
            // 3. ai_summary 컬럼 추가
            {
                name: "Add ai_summary column",
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;`
            },
            // 4. ai_analyzed_at 컬럼 추가
            {
                name: "Add ai_analyzed_at column",
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;`
            },
            // 5. ai_model_version 컬럼 추가
            {
                name: "Add ai_model_version column",
                sql: `ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);`
            },
            // 6. 인덱스 추가
            {
                name: "Create index on is_relevant",
                sql: `CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant);`
            },
            {
                name: "Create index on ai_score",
                sql: `CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score);`
            }
        ];

        const results = [];
        const errors = [];

        for (const migration of migrations) {
            try {
                console.log(`📝 Executing: ${migration.name}`);
                const { error } = await supabase.rpc('exec_sql', { query: migration.sql });
                
                if (error) {
                    // RPC가 없을 수 있으니 직접 쿼리 시도
                    const { error: directError } = await supabase
                        .from('_migrations')
                        .insert({ name: migration.name, sql: migration.sql });
                    
                    if (directError) {
                        throw new Error(`Migration failed: ${error.message || directError.message}`);
                    }
                }
                
                results.push({ migration: migration.name, status: 'success' });
                console.log(`✅ ${migration.name} completed`);
            } catch (err: any) {
                console.error(`❌ ${migration.name} failed:`, err);
                errors.push({ migration: migration.name, error: err.message });
            }
        }

        if (errors.length > 0) {
            return NextResponse.json({
                success: false,
                message: "Some migrations failed. Please run the SQL manually in Supabase Dashboard.",
                results,
                errors,
                sql_to_run_manually: `
-- Copy and paste this SQL in Supabase Dashboard SQL Editor:

ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant);
CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score);
                `
            }, { status: 207 }); // 207 Multi-Status
        }

        return NextResponse.json({
            success: true,
            message: "Database migration completed successfully!",
            results
        });

    } catch (error: any) {
        console.error("Migration failed:", error);
        return NextResponse.json({
            error: "Internal Server Error",
            details: error.message || String(error),
            sql_to_run_manually: `
-- Copy and paste this SQL in Supabase Dashboard SQL Editor:

ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_score DECIMAL(5, 2);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_relevant BOOLEAN DEFAULT NULL;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_model_version VARCHAR(50);
CREATE INDEX IF NOT EXISTS idx_articles_is_relevant ON articles(is_relevant);
CREATE INDEX IF NOT EXISTS idx_articles_ai_score ON articles(ai_score);
            `
        }, { status: 500 });
    }
}
