/**
 * LNG 터미널 타입 정의
 */

export interface GasTerminal {
  id: string;
  type: string;
  category?: '가스공사' | '민간';
  owner: string;
  terminal_name: string;
  tank_number?: number;
  location?: string;
  capacity_kl?: number;
  capacity_mtpa?: number;
  status?: '운영' | '건설' | '계획';
  operation_start?: string;
  closure_planned?: string;
  latitude?: number;
  longitude?: number;
  geocoded?: boolean;
  created_at?: string;
  updated_at?: string;
}

