/**
 * LNG 가스발전소 데이터를 데이터베이스에 업로드하는 유틸리티
 */

import { getSql } from '@/lib/db';
import type { GasPlant } from '@/types/gasPlant';

export async function uploadGasPlantsToSupabase(plants: GasPlant[]): Promise<{ success: number; failed: number }> {
  const sql = getSql();

  let success = 0;
  let failed = 0;

  for (const p of plants) {
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
    } catch (err) {
      console.error(`${p.plant_name} 업로드 실패:`, err);
      failed++;
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
