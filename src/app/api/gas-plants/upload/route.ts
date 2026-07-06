/**
 * LNG 가스발전소 데이터 업로드 API
 * POST /api/gas-plants/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
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

    // NaN 값이 있는 경우 추가로 정리 + 좌표가 없으면 주소로 geocoding 시도
    const { geocodeKoreanAddress } = await import('@/lib/geocoding');

    const cleanedPlants = await Promise.all(plants.map(async (plant: any) => {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(plant)) {
        // NaN, Infinity, -Infinity를 null로 변환
        if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
          cleaned[key] = null;
        } else {
          cleaned[key] = value;
        }
      }

      // 좌표가 없고 주소가 있으면 geocoding 시도
      if ((!cleaned.latitude || !cleaned.longitude || cleaned.latitude === null || cleaned.longitude === null || cleaned.latitude === 0 || cleaned.longitude === 0) && cleaned.location) {
        console.log(`Geocoding attempt for ${cleaned.plant_name} at ${cleaned.location}`);
        try {
          // 약간의 지연을 추가하여 API rate limit 방지
          await new Promise(resolve => setTimeout(resolve, 1000));

          const geocodeResult = await geocodeKoreanAddress(cleaned.location);
          if ('latitude' in geocodeResult && !('error' in geocodeResult)) {
            cleaned.latitude = geocodeResult.latitude;
            cleaned.longitude = geocodeResult.longitude;
            cleaned.geocoded = true;
            console.log(`✓ Geocoded ${cleaned.plant_name}: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
          } else {
            console.warn(`✗ Geocoding failed for ${cleaned.plant_name}:`, 'error' in geocodeResult ? geocodeResult.message : 'Unknown error');
          }
        } catch (error) {
          console.error(`✗ Geocoding error for ${cleaned.plant_name}:`, error);
        }
      }

      return cleaned;
    }));

    const sql = getSql();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const p of cleanedPlants) {
      try {
        await sql`
          INSERT INTO gas_plants
            (id, type, owner, plant_name, unit_number, location, capacity_mw, status,
             operation_start, closure_planned, note, latitude, longitude, geocoded)
          VALUES
            (${p.id}, ${p.type}, ${p.owner}, ${p.plant_name}, ${p.unit_number ?? null},
             ${p.location ?? null}, ${p.capacity_mw}, ${p.status ?? null},
             ${p.operation_start ?? null}, ${p.closure_planned ?? null}, ${p.note ?? null},
             ${p.latitude ?? null}, ${p.longitude ?? null}, ${p.geocoded ?? false})
          ON CONFLICT (id) DO UPDATE SET
            type = EXCLUDED.type, owner = EXCLUDED.owner, plant_name = EXCLUDED.plant_name,
            unit_number = EXCLUDED.unit_number, location = EXCLUDED.location,
            capacity_mw = EXCLUDED.capacity_mw, status = EXCLUDED.status,
            operation_start = EXCLUDED.operation_start, closure_planned = EXCLUDED.closure_planned,
            note = EXCLUDED.note, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
            geocoded = EXCLUDED.geocoded, updated_at = now()`;
        success++;
      } catch (err: any) {
        console.error(`${p.plant_name} 업로드 실패:`, err);
        failed++;
        errors.push(`${p.plant_name}: ${err.message}`);
      }
    }

    // 업로드 결과 확인
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM gas_plants`;

    return NextResponse.json({
      success: true,
      summary: {
        total: cleanedPlants.length,
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
