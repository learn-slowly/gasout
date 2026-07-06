"use client";

import { useEffect, useState } from "react";
import type { GasPlant } from "@/types/gasPlant";
import type { GasTerminal } from "@/types/gasTerminal";
import { KOREAN_REGIONS, extractRegion } from "@/lib/regions";

// CSS import is safe on server (handled by bundler, doesn't need window)
import "leaflet/dist/leaflet.css";

// Leaflet JS imports - lazy loaded to avoid SSR "window is not defined" error
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, useMap: any;
let L: any;
if (typeof window !== "undefined") {
  const rl = require("react-leaflet");
  MapContainer = rl.MapContainer;
  TileLayer = rl.TileLayer;
  Marker = rl.Marker;
  Popup = rl.Popup;
  useMap = rl.useMap;
  L = require("leaflet");
}

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

// 발전소를 plant_name 기준으로 그룹핑한 사이트 타입
type PlantSite = {
  plant_name: string;
  type: GasPlant['type'];
  owner: string;
  status: GasPlant['status'];
  location: GasPlant['location'];
  latitude: GasPlant['latitude'];
  longitude: GasPlant['longitude'];
  totalCapacity: number;
  unitCount: number;
  units: GasPlant[];
};

function groupPlantsBySite(plants: GasPlant[]): PlantSite[] {
  const siteMap = new Map<string, GasPlant[]>();
  for (const plant of plants) {
    const key = plant.plant_name;
    if (!siteMap.has(key)) siteMap.set(key, []);
    siteMap.get(key)!.push(plant);
  }
  return Array.from(siteMap.entries()).map(([name, units]) => ({
    plant_name: name,
    type: units[0].type,
    owner: units[0].owner,
    status: units[0].status,
    location: units[0].location,
    latitude: units[0].latitude,
    longitude: units[0].longitude,
    totalCapacity: units.reduce((sum, u) => sum + (u.capacity_mw || 0), 0),
    unitCount: units.length,
    units,
  }));
}

/**
 * 발전소 사이트 마커 아이콘을 생성합니다.
 * 발전소 유형에 따라 색상을 다르게 하고, 총 용량에 따라 크기를 조절합니다.
 */
function createPlantIcon(site: PlantSite) {
  const color = site.type === '복합발전' ? '#60a5fa' : '#a78bfa';
  const size = Math.max(15, Math.min(30, Math.sqrt(site.totalCapacity) / 2));

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
  const color = terminal.category === '가스공사' ? '#f87171' : '#fb923c';
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

// KOREAN_REGIONS와 extractRegion은 @/lib/regions에서 가져옴
export { KOREAN_REGIONS, extractRegion } from "@/lib/regions";

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

/**
 * 지역 필터 변경 시 해당 지역으로 지도를 이동시키는 컴포넌트입니다.
 */
function FlyToRegion({ regionFilter }: { regionFilter: string }) {
  const map = useMap();

  useEffect(() => {
    if (regionFilter === 'all') {
      // 전체 보기: 한국 전체가 보이도록
      map.flyTo([36.5, 127.8], 7, { duration: 1 });
    } else {
      const region = KOREAN_REGIONS[regionFilter];
      if (region) {
        map.flyTo(region.center, region.zoom, { duration: 1 });
      }
    }
  }, [map, regionFilter]);

  return null;
}

type Props = {
  showPlants?: boolean;
  showTerminals?: boolean;
  plantTypeFilter?: '복합발전' | '열병합발전' | 'all';
  terminalCategoryFilter?: '가스공사' | '민간' | 'all';
  statusFilter?: '운영' | '건설' | '계획' | 'all';
  regionFilter?: string;
  onPlantClick?: (plant: GasPlant) => void;
  onTerminalClick?: (terminal: GasTerminal) => void;
};

export default function IntegratedGasMap({
  showPlants = true,
  showTerminals = true,
  plantTypeFilter = 'all',
  terminalCategoryFilter = 'all',
  statusFilter = 'all',
  regionFilter = 'all',
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
        // 발전소·터미널 데이터 로드 - 좌표가 있는 항목만 조회
        const [plantRes, terminalRes] = await Promise.all([
          fetch('/api/gas-plants?with_coords=1'),
          fetch('/api/gas-terminals?with_coords=1'),
        ]);

        if (!plantRes.ok) {
          console.error('Error loading gas plants:', plantRes.status);
        } else {
          const { plants: plantData } = await plantRes.json();
          const loadedCount = plantData?.length || 0;
          console.log(`IntegratedGasMap: Loaded ${loadedCount} plants with coordinates`);
          setPlants((plantData || []) as GasPlant[]);
        }

        if (!terminalRes.ok) {
          console.error('Error loading gas terminals:', terminalRes.status);
        } else {
          const { terminals: terminalData } = await terminalRes.json();
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
    const regionMatch = regionFilter === 'all' || extractRegion(plant.location) === regionFilter;
    return typeMatch && statusMatch && regionMatch;
  });

  // 필터링된 터미널
  const filteredTerminals = terminals.filter(terminal => {
    if (!showTerminals) return false;
    const categoryMatch = terminalCategoryFilter === 'all' || terminal.category === terminalCategoryFilter;
    const statusMatch = statusFilter === 'all' || terminal.status === statusFilter;
    const regionMatch = regionFilter === 'all' || extractRegion(terminal.location) === regionFilter;
    return categoryMatch && statusMatch && regionMatch;
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

  // 발전소를 사이트별로 그룹핑
  const plantSites = groupPlantsBySite(filteredPlants);

  const sitesWithCoords = plantSites.filter(s => {
    const lat = normalizeCoordinate(s.latitude);
    const lng = normalizeCoordinate(s.longitude);
    return lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng);
  });

  const terminalsWithCoords = filteredTerminals.filter(t => {
    const lat = normalizeCoordinate(t.latitude);
    const lng = normalizeCoordinate(t.longitude);
    return lat != null && lng != null && isValidCoordinate(lat) && isValidCoordinate(lng);
  });

  console.log(`IntegratedGasMap: Plant sites: ${plantSites.length} (from ${filteredPlants.length} units), terminals: ${filteredTerminals.length}`);
  console.log(`IntegratedGasMap: Sites with valid coords: ${sitesWithCoords.length}, Terminals with valid coords: ${terminalsWithCoords.length}`);

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
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          {allPoints.length > 0 && regionFilter === 'all' && <FitToMarkers points={allPoints} />}
          <FlyToRegion regionFilter={regionFilter} />

          {/* 발전소 마커 (사이트별 그룹) */}
          {sitesWithCoords.map(site => {
              const lat = normalizeCoordinate(site.latitude)!;
              const lng = normalizeCoordinate(site.longitude)!;
              return (
              <Marker
                key={`site-${site.plant_name}`}
                position={[lat, lng]}
                icon={createPlantIcon(site)}
                eventHandlers={{
                  click: () => onPlantClick?.(site.units[0]),
                }}
              >
                <Popup>
                  <div className="min-w-[250px]">
                    <div className="font-bold text-base mb-1">{site.plant_name}</div>
                    <div className="text-xs text-blue-600 mb-2">발전소 · {site.unitCount}기</div>
                    <div className="text-sm space-y-1">
                      <div><strong>유형:</strong> {site.type}</div>
                      <div><strong>소유주:</strong> {site.owner}</div>
                      <div><strong>총 용량:</strong> {site.totalCapacity.toLocaleString()} MW</div>
                      {site.status && (
                        <div>
                          <strong>상태:</strong>{' '}
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${site.status === '운영' ? 'bg-green-100 text-green-800' :
                            site.status === '건설' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                            {site.status}
                          </span>
                        </div>
                      )}
                      {site.location && (
                        <div><strong>위치:</strong> {site.location}</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
              );
            })}

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

