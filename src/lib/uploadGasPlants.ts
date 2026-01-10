/**
 * LNG 가스발전소 데이터를 Supabase에 업로드하는 유틸리티
 */

import { createClient } from '@supabase/supabase-js';
import type { GasPlant } from '@/types/gasPlant';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export async function uploadGasPlantsToSupabase(plants: GasPlant[]): Promise<{ success: number; failed: number }> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase URL과 Service Role Key가 설정되지 않았습니다.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let success = 0;
  let failed = 0;

  // 배치 크기 설정 (한 번에 업로드할 레코드 수)
  const batchSize = 50;
  const total = plants.length;

  for (let i = 0; i < total; i += batchSize) {
    const batch = plants.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from('gas_plants')
        .upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error(`배치 ${Math.floor(i / batchSize) + 1} 업로드 실패:`, error);
        // 개별 레코드 업로드 시도
        for (const plant of batch) {
          try {
            const { error: singleError } = await supabase
              .from('gas_plants')
              .upsert(plant, { onConflict: 'id' });
            
            if (singleError) {
              console.error(`${plant.plant_name} 업로드 실패:`, singleError);
              failed++;
            } else {
              success++;
            }
          } catch (err) {
            console.error(`${plant.plant_name} 업로드 실패:`, err);
            failed++;
          }
        }
      } else {
        success += batch.length;
      }
    } catch (err) {
      console.error(`배치 ${Math.floor(i / batchSize) + 1} 업로드 실패:`, err);
      failed += batch.length;
    }
  }

  return { success, failed };
}

export async function loadGasPlantsFromJson(filePath: string): Promise<GasPlant[]> {
  // 서버 사이드에서만 실행 가능
  if (typeof window !== 'undefined') {
    throw new Error('이 함수는 서버 사이드에서만 실행 가능합니다.');
  }

  const fs = await import('fs/promises');
  const path = await import('path');
  
  const fullPath = path.join(process.cwd(), filePath);
  const fileContent = await fs.readFile(fullPath, 'utf-8');
  return JSON.parse(fileContent);
}

