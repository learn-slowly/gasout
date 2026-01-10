/**
 * LNG 터미널 데이터 업로드 API
 * POST /api/gas-terminals/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase 설정이 완료되지 않았습니다.' },
        { status: 500 }
      );
    }

    const dataFilePath = path.join(process.cwd(), 'data', 'gas_terminals.json');
    
    // 파일 읽기 (NaN 값을 null로 변환)
    let fileContent = await fs.readFile(dataFilePath, 'utf-8');
    fileContent = fileContent.replace(/:\s*NaN([,\]\}])/g, ': null$1');
    fileContent = fileContent.replace(/:\s*Infinity([,\]\}])/g, ': null$1');
    fileContent = fileContent.replace(/:\s*-Infinity([,\]\}])/g, ': null$1');
    
    let terminals;
    try {
      terminals = JSON.parse(fileContent);
    } catch (parseError: any) {
      throw new Error(`JSON 파싱 실패: ${parseError.message}`);
    }
    
    // NaN 값 정리
    const cleanedTerminals = terminals.map((terminal: any) => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(terminal)) {
        if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
          cleaned[key] = null;
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    const batchSize = 50;
    const total = cleanedTerminals.length;

    for (let i = 0; i < total; i += batchSize) {
      const batch = cleanedTerminals.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('gas_terminals')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          console.error(`배치 ${Math.floor(i / batchSize) + 1} 업로드 실패:`, error);
          errors.push(`배치 ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          
          for (const terminal of batch) {
            try {
              const { error: singleError } = await supabase
                .from('gas_terminals')
                .upsert(terminal, { onConflict: 'id' });
              
              if (singleError) {
                failed++;
                errors.push(`${terminal.terminal_name}: ${singleError.message}`);
              } else {
                success++;
              }
            } catch (err: any) {
              failed++;
              errors.push(`${terminal.terminal_name}: ${err.message}`);
            }
          }
        } else {
          success += batch.length;
        }
      } catch (err: any) {
        console.error(`배치 ${Math.floor(i / batchSize) + 1} 업로드 실패:`, err);
        failed += batch.length;
        errors.push(`배치 ${Math.floor(i / batchSize) + 1}: ${err.message}`);
      }
    }

    const { count } = await supabase
      .from('gas_terminals')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      summary: {
        total: total,
        success,
        failed,
        totalInDatabase: count || 0,
      },
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || '데이터 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

