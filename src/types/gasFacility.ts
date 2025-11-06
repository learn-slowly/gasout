/**
 * 통합 시설 타입 정의 (발전소 + 터미널)
 */

export interface GasFacility {
  id: string;
  type: string;
  category?: string | null;
  owner: string;
  name: string;
  tank_number?: number | null;
  location?: string;
  capacity?: number | null;
  capacity_unit?: string;
  capacity_kl?: number | null;
  status?: string;
  operation_start?: string;
  closure_planned?: string;
  latitude?: number;
  longitude?: number;
  geocoded?: boolean;
  facility_category: 'plant' | 'terminal';
}

