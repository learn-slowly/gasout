/**
 * 좌표가 없는 발전소에 대해 자동 geocoding 수행
 * POST /api/gas-plants/geocode-missing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { geocodeKoreanAddress } from '@/src/lib/geocoding';

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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 좌표가 없는 발전소 조회
    const { data: plantsWithoutCoords, error: fetchError } = await supabase
      .from('gas_plants')
      .select('*')
      .or('latitude.is.null,longitude.is.null')
      .not('location', 'is', null);

    if (fetchError) {
      return NextResponse.json(
        { error: `데이터 조회 실패: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!plantsWithoutCoords || plantsWithoutCoords.length === 0) {
      return NextResponse.json({
        success: true,
        message: '좌표가 없는 발전소가 없습니다.',
        summary: {
          total: 0,
          geocoded: 0,
          failed: 0
        }
      });
    }

    let geocoded = 0;
    let failed = 0;
    const errors: string[] = [];

    // 각 발전소에 대해 geocoding 수행
    for (const plant of plantsWithoutCoords) {
      if (!plant.location) {
        failed++;
        errors.push(`${plant.plant_name}: 주소가 없습니다.`);
        continue;
      }

      try {
        // API rate limit 방지를 위한 지연
        await new Promise(resolve => setTimeout(resolve, 1000));

        const geocodeResult = await geocodeKoreanAddress(plant.location);
        
        if ('latitude' in geocodeResult && !('error' in geocodeResult)) {
          const { error: updateError } = await supabase
            .from('gas_plants')
            .update({
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
              geocoded: true
            })
            .eq('id', plant.id);

          if (updateError) {
            failed++;
            errors.push(`${plant.plant_name}: 업데이트 실패 - ${updateError.message}`);
          } else {
            geocoded++;
            console.log(`✓ Geocoded ${plant.plant_name}: ${geocodeResult.latitude}, ${geocodeResult.longitude}`);
          }
        } else {
          failed++;
          const errorMsg = 'error' in geocodeResult ? geocodeResult.message : 'Unknown error';
          errors.push(`${plant.plant_name}: ${errorMsg}`);
          console.warn(`✗ Geocoding failed for ${plant.plant_name}:`, errorMsg);
        }
      } catch (error: any) {
        failed++;
        errors.push(`${plant.plant_name}: ${error.message || 'Geocoding 오류'}`);
        console.error(`✗ Geocoding error for ${plant.plant_name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: plantsWithoutCoords.length,
        geocoded,
        failed,
      },
      errors: errors.slice(0, 20), // 최대 20개 에러만 반환
    });
  } catch (error: any) {
    console.error('Geocode missing error:', error);
    return NextResponse.json(
      { error: error.message || 'Geocoding 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

