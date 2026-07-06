/**
 * LNG 터미널 데이터 업로드 API
 * POST /api/gas-terminals/upload
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSql } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
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

    const sql = getSql();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const t of cleanedTerminals) {
      try {
        await sql`
          INSERT INTO gas_terminals
            (id, type, category, owner, terminal_name, tank_number, location, capacity_kl,
             capacity_mtpa, status, operation_start, closure_planned, latitude, longitude, geocoded)
          VALUES
            (${t.id}, ${t.type}, ${t.category ?? null}, ${t.owner}, ${t.terminal_name}, ${t.tank_number ?? null},
             ${t.location ?? null}, ${t.capacity_kl ?? null}, ${t.capacity_mtpa ?? null}, ${t.status ?? null},
             ${t.operation_start ?? null}, ${t.closure_planned ?? null},
             ${t.latitude ?? null}, ${t.longitude ?? null}, ${t.geocoded ?? false})
          ON CONFLICT (id) DO UPDATE SET
            type = EXCLUDED.type, category = EXCLUDED.category, owner = EXCLUDED.owner,
            terminal_name = EXCLUDED.terminal_name, tank_number = EXCLUDED.tank_number,
            location = EXCLUDED.location, capacity_kl = EXCLUDED.capacity_kl,
            capacity_mtpa = EXCLUDED.capacity_mtpa, status = EXCLUDED.status,
            operation_start = EXCLUDED.operation_start, closure_planned = EXCLUDED.closure_planned,
            latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
            geocoded = EXCLUDED.geocoded, updated_at = now()`;
        success++;
      } catch (err: any) {
        console.error(`${t.terminal_name} 업로드 실패:`, err);
        failed++;
        errors.push(`${t.terminal_name}: ${err.message}`);
      }
    }

    const [{ count }] = (await sql`SELECT count(*)::int AS count FROM gas_terminals`) as Record<string, number>[];

    return NextResponse.json({
      success: true,
      summary: {
        total: cleanedTerminals.length,
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
