/**
 * LNG 가스발전소 데이터 업로드 API
 * POST /api/gas-plants/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// 환경 변수 이름 확인: SUPABASE_SERVICE_ROLE_KEY 또는 SUPABASE_SERVICE_KEY
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase 설정이 완료되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 파일 경로 확인
    const dataFilePath = path.join(process.cwd(), 'data', 'gas_plants_with_coords.json');
    
    // 파일 읽기 (NaN 값을 null로 변환)
    let fileContent = await fs.readFile(dataFilePath, 'utf-8');
    // NaN 값을 null로 변환 (JSON 표준에 맞게)
    // 정규식: 숫자나 문자열 앞뒤의 NaN을 찾아서 null로 변환
    fileContent = fileContent.replace(/:\s*NaN([,\]\}])/g, ': null$1');
    fileContent = fileContent.replace(/:\s*Infinity([,\]\}])/g, ': null$1');
    fileContent = fileContent.replace(/:\s*-Infinity([,\]\}])/g, ': null$1');
    
    let plants;
    try {
      plants = JSON.parse(fileContent);
    } catch (parseError: any) {
      console.error('JSON parse error:', parseError.message);
      // 파일에서 NaN이 있는 줄을 직접 확인
      const lines = fileContent.split('\n');
      const errorLine = parseError.message.match(/position (\d+)/)?.[1];
      if (errorLine) {
        const pos = parseInt(errorLine);
        let charCount = 0;
        for (let i = 0; i < lines.length; i++) {
          charCount += lines[i].length + 1; // +1 for newline
          if (charCount > pos) {
            console.error(`Error around line ${i + 1}:`, lines[i]?.substring(0, 100));
            break;
          }
        }
      }
      throw new Error(`JSON 파싱 실패: ${parseError.message}. 파일에 유효하지 않은 값(NaN 등)이 있을 수 있습니다.`);
    }
    
    // NaN 값이 있는 경우 추가로 정리
    const cleanedPlants = plants.map((plant: any) => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(plant)) {
        // NaN, Infinity, -Infinity를 null로 변환
        if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
          cleaned[key] = null;
        } else {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

    // Supabase 클라이언트 생성
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // 배치 크기 설정
    const batchSize = 50;
    const total = cleanedPlants.length;

    for (let i = 0; i < total; i += batchSize) {
      const batch = cleanedPlants.slice(i, i + batchSize);
      
      try {
        const { error } = await supabase
          .from('gas_plants')
          .upsert(batch, { onConflict: 'id' });
        
        if (error) {
          console.error(`배치 ${Math.floor(i / batchSize) + 1} 업로드 실패:`, error);
          errors.push(`배치 ${Math.floor(i / batchSize) + 1}: ${error.message}`);
          
          // 개별 레코드 업로드 시도
          for (const plant of batch) {
            try {
              const { error: singleError } = await supabase
                .from('gas_plants')
                .upsert(plant, { onConflict: 'id' });
              
              if (singleError) {
                failed++;
                errors.push(`${plant.plant_name}: ${singleError.message}`);
              } else {
                success++;
              }
            } catch (err: any) {
              failed++;
              errors.push(`${plant.plant_name}: ${err.message}`);
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

    // 업로드 결과 확인
    const { count, error: verifyError } = await supabase
      .from('gas_plants')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      summary: {
        total: total,
        success,
        failed,
        totalInDatabase: count || 0,
      },
      errors: errors.slice(0, 10), // 최대 10개 에러만 반환
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || '데이터 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

