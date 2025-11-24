"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/src/lib/supabase";
import type { GasPlant } from "@/src/types/gasPlant";
import type { GasTerminal } from "@/src/types/gasTerminal";

/**
 * Leaflet의 기본 마커 아이콘 경로 문제를 해결합니다.
 * Next.js와 같은 번들링 환경에서 이미지 경로가 깨지는 것을 방지하기 위해
 * CDN URL을 직접 지정합니다.
 */
const fixDefaultIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
};

/**
 * 발전소 마커 아이콘을 생성합니다.
 * 발전소 유형에 따라 색상을 다르게 하고, 용량에 따라 크기를 조절합니다.
 * L.divIcon을 사용하여 CSS로 스타일링된 커스텀 마커를 만듭니다.
 */
function createPlantIcon(plant: GasPlant) {
  const color = plant.type === '복합발전' ? '#000000' : '#4b5563'; // 검정 / 어두운 회색
  // 용량에 비례하여 마커 크기 계산 (최소 15px, 최대 30px)
  const size = Math.max(15, Math.min(30, Math.sqrt(plant.capacity_mw) / 2));

  return L.divIcon({
    className: 'custom-gas-plant-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      min-width: ${size}px;
      min-height: ${size}px;
      max-width: ${size}px;
      max-height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      flex-shrink: 0;
      box-sizing: border-box;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * 터미널 마커 아이콘을 생성합니다.
 * 운영 주체(가스공사/민간)에 따라 색상을 구분합니다.
 * 마름모 형태(45도 회전)로 발전소와 시각적으로 구분합니다.
 */
function createTerminalIcon(terminal: GasTerminal) {
  const color = terminal.category === '가스공사' ? '#dc2626' : '#f97316';
  const size = 20;

  return L.divIcon({
    className: 'custom-gas-terminal-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      min-width: ${size}px;
      min-height: ${size}px;
      max-width: ${size}px;
      max-height: ${size}px;
      border-radius: 4px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: rotate(45deg);
      flex-shrink: 0;
      box-sizing: border-box;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * 지도의 줌 레벨과 중심을 모든 마커가 보이도록 자동으로 조정하는 컴포넌트입니다.
 * useMap 훅을 사용하여 Leaflet 지도 인스턴스에 접근합니다.
 */
function FitToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // 포인트가 없거나 이미 초기화되었다면 실행하지 않음
    if (!points || points.length === 0 || hasInitialized) return;

    // 모든 포인트를 포함하는 경계(bounds) 계산
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    // 계산된 경계에 맞게 지도 뷰 조정 (padding으로 여백 추가)
    map.fitBounds(bounds, { padding: [32, 32] });
    setHasInitialized(true);
  }, [map, points, hasInitialized]);

  return null;
}

type Props = {
  showPlants?: boolean;
  showTerminals?: boolean;
  plantTypeFilter?: '복합발전' | '열병합발전' | 'all';
  terminalCategoryFilter?: '가스공사' | '민간' | 'all';
  statusFilter?: '운영' | '건설' | '계획' | 'all';
  onPlantClick?: (plant: GasPlant) => void;
  onTerminalClick?: (terminal: GasTerminal) => void;
};

export default function IntegratedGasMap({
  showPlants = true,
  showTerminals = true,
  plantTypeFilter = 'all',
  terminalCategoryFilter = 'all',
  statusFilter = 'all',
  onPlantClick,
  onTerminalClick
}: Props) {
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [terminals, setTerminals] = useState<GasTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트 사이드 렌더링 확인 및 아이콘 수정
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsClient(true);
    fixDefaultIcon();
    
    // DOM이 완전히 준비된 후에만 맵을 렌더링
    // requestAnimationFrame을 사용하여 다음 프레임에서 렌더링 보장
    requestAnimationFrame(() => {
      setIsMounted(true);
    });
  }, []);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          console.error('Supabase client is not initialized');
          setLoading(false);
          return;
        }

        // 발전소 데이터 로드 - 좌표가 있는 항목만 조회
        let plantQuery = supabase
          .from('gas_plants')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        const { data: plantData, error: plantError } = await plantQuery;

        if (plantError) {
          console.error('Error loading gas plants:', plantError);
        } else {
          const loadedCount = plantData?.length || 0;
          console.log(`IntegratedGasMap: Loaded ${loadedCount} plants with coordinates`);
          setPlants((plantData || []) as GasPlant[]);
        }

        // 터미널 데이터 로드 - 좌표가 있는 항목만 조회
        let terminalQuery = supabase
          .from('gas_terminals')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        const { data: terminalData, error: terminalError } = await terminalQuery;

        if (terminalError) {
          console.error('Error loading gas terminals:', terminalError);
        } else {
          const loadedCount = terminalData?.length || 0;
          console.log(`IntegratedGasMap: Loaded ${loadedCount} terminals with coordinates`);
          setTerminals((terminalData || []) as GasTerminal[]);
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isClient) {
      loadData();
    }
  }, [isClient]);

  // 필터링된 발전소
  const filteredPlants = plants.filter(plant => {
    if (!showPlants) return false;
    const typeMatch = plantTypeFilter === 'all' || plant.type === plantTypeFilter;
    const statusMatch = statusFilter === 'all' || plant.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // 필터링된 터미널
  const filteredTerminals = terminals.filter(terminal => {
    if (!showTerminals) return false;
    const categoryMatch = terminalCategoryFilter === 'all' || terminal.category === terminalCategoryFilter;
    const statusMatch = statusFilter === 'all' || terminal.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  if (!isClient || !isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        지도를 초기화하는 중...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        데이터를 불러오는 중...
      </div>
    );
  }

  // 좌표 유효성 검사 헬퍼 함수
  const isValidCoordinate = (value: any): boolean => {
    if (value == null) return false;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || !isFinite(num)) return false;
    // 한국 좌표 범위: 위도 33-43, 경도 124-132
    if (num === 0) return false;
    return true;
  };

  // 좌표 정규화 헬퍼 함수
  const normalizeCoordinate = (value: any): number | null => {
    if (value == null) return null;
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || !isFinite(num) || num === 0) return null;
    return num;
  };

  const allPoints = [
    ...filteredPlants
      .map(p => {
        const lat = normalizeCoordinate(p.latitude);
        const lng = normalizeCoordinate(p.longitude);
        if (lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng)) {
          return { lat, lng };
        }
        return null;
      })
      .filter((p): p is { lat: number; lng: number } => p != null),
    ...filteredTerminals
      .map(t => {
        const lat = normalizeCoordinate(t.latitude);
        const lng = normalizeCoordinate(t.longitude);
        if (lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng)) {
          return { lat, lng };
        }
        return null;
      })
      .filter((t): t is { lat: number; lng: number } => t != null)
  ];

  const plantsWithCoords = filteredPlants.filter(p => {
    const lat = normalizeCoordinate(p.latitude);
    const lng = normalizeCoordinate(p.longitude);
    return lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng);
  });

  const terminalsWithCoords = filteredTerminals.filter(t => {
    const lat = normalizeCoordinate(t.latitude);
    const lng = normalizeCoordinate(t.longitude);
    return lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng);
  });

  console.log(`IntegratedGasMap: Filtered plants: ${filteredPlants.length}, terminals: ${filteredTerminals.length}`);
  console.log(`IntegratedGasMap: Plants with valid coords: ${plantsWithCoords.length}, Terminals with valid coords: ${terminalsWithCoords.length}`);
  console.log(`IntegratedGasMap: Total points for map: ${allPoints.length}`);

  return (
    <div className="w-full h-full">
      {isClient && isMounted && typeof window !== 'undefined' && (
        <MapContainer
          center={[36.5, 127.8]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {allPoints.length > 0 && <FitToMarkers points={allPoints} />}

          {/* 발전소 마커 */}
          {filteredPlants
            .map(plant => {
              const lat = normalizeCoordinate(plant.latitude);
              const lng = normalizeCoordinate(plant.longitude);
              if (lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng)) {
                return { plant, lat, lng };
              }
              return null;
            })
            .filter((item): item is { plant: GasPlant; lat: number; lng: number } => item != null)
            .map(({ plant, lat, lng }) => (
              <Marker
                key={`plant-${plant.id}`}
                position={[lat, lng]}
                icon={createPlantIcon(plant)}
                eventHandlers={{
                  click: () => onPlantClick?.(plant),
                }}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <div className="font-bold text-base mb-2">{plant.plant_name}</div>
                    <div className="text-xs text-blue-600 mb-2">발전소</div>
                    <div className="text-sm space-y-1">
                      <div><strong>유형:</strong> {plant.type}</div>
                      <div><strong>소유주:</strong> {plant.owner}</div>
                      <div><strong>용량:</strong> {plant.capacity_mw.toLocaleString()} MW</div>
                      {plant.status && (
                        <div>
                          <strong>상태:</strong>{' '}
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${plant.status === '운영' ? 'bg-green-100 text-green-800' :
                            plant.status === '건설' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {plant.status}
                          </span>
                        </div>
                      )}
                      {plant.location && (
                        <div><strong>위치:</strong> {plant.location}</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* 터미널 마커 */}
          {filteredTerminals
            .map(terminal => {
              const lat = normalizeCoordinate(terminal.latitude);
              const lng = normalizeCoordinate(terminal.longitude);
              if (lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng)) {
                return { terminal, lat, lng };
              }
              return null;
            })
            .filter((item): item is { terminal: GasTerminal; lat: number; lng: number } => item != null)
            .map(({ terminal, lat, lng }) => (
              <Marker
                key={`terminal-${terminal.id}`}
                position={[lat, lng]}
                icon={createTerminalIcon(terminal)}
                eventHandlers={{
                  click: () => onTerminalClick?.(terminal),
                }}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <div className="font-bold text-base mb-2">{terminal.terminal_name}</div>
                    <div className="text-xs text-red-600 mb-2">LNG 터미널</div>
                    <div className="text-sm space-y-1">
                      <div><strong>분류:</strong> {terminal.category}</div>
                      <div><strong>소유주:</strong> {terminal.owner}</div>
                      {terminal.tank_number && (
                        <div><strong>탱크 번호:</strong> {terminal.tank_number}호기</div>
                      )}
                      {terminal.capacity_kl && (
                        <div><strong>저장용량:</strong> {terminal.capacity_kl.toLocaleString()} 만kl</div>
                      )}
                      {terminal.status && (
                        <div>
                          <strong>상태:</strong>{' '}
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${terminal.status === '운영' ? 'bg-green-100 text-green-800' :
                            terminal.status === '건설' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {terminal.status}
                          </span>
                        </div>
                      )}
                      {terminal.location && (
                        <div><strong>위치:</strong> {terminal.location}</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      )}
    </div>
  );
}

