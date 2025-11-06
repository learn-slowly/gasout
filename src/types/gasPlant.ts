/**
 * LNG 가스발전소 타입 정의
 */

export interface GasPlant {
  id: string;
  type: '복합발전' | '열병합발전';
  owner: string;
  plant_name: string;
  unit_number?: number;
  location?: string;
  capacity_mw: number;
  status?: '운영' | '건설' | '계획';
  operation_start?: string;
  closure_planned?: string;
  note?: string;
  latitude?: number;
  longitude?: number;
  geocoded?: boolean;
  created_at?: string;
  updated_at?: string;
}

