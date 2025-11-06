"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/src/lib/supabase";
import type { GasPlant } from "@/src/types/gasPlant";
import type { GasTerminal } from "@/src/types/gasTerminal";

// Leaflet 기본 아이콘 설정
const fixDefaultIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
};

// 발전소 아이콘 생성
function createPlantIcon(plant: GasPlant) {
  const color = plant.type === '복합발전' ? '#000000' : '#4b5563'; // 검정 / 어두운 회색
  const size = Math.max(15, Math.min(30, Math.sqrt(plant.capacity_mw) / 2));
  
  return L.divIcon({
    className: 'custom-gas-plant-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// 터미널 아이콘 생성
function createTerminalIcon(terminal: GasTerminal) {
  const color = terminal.category === '가스공사' ? '#dc2626' : '#f97316';
  const size = 20;
  
  return L.divIcon({
    className: 'custom-gas-terminal-marker',
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 4px;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: rotate(45deg);
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// 지도 범위 자동 조정
function FitToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
  const map = useMap();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  useEffect(() => {
    if (!points || points.length === 0 || hasInitialized) return;
    
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
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

  useEffect(() => {
    setIsClient(true);
    fixDefaultIcon();
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          console.error('Supabase client is not initialized');
          setLoading(false);
          return;
        }

        // 발전소 로드
        if (showPlants) {
          let plantQuery = supabase
            .from('gas_plants')
            .select('*')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

          const { data: plantData, error: plantError } = await plantQuery;

          if (plantError) {
            console.error('Error loading gas plants:', plantError);
          } else {
            setPlants((plantData || []) as GasPlant[]);
          }
        }

        // 터미널 로드
        if (showTerminals) {
          let terminalQuery = supabase
            .from('gas_terminals')
            .select('*')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

          const { data: terminalData, error: terminalError } = await terminalQuery;

          if (terminalError) {
            console.error('Error loading gas terminals:', terminalError);
          } else {
            setTerminals((terminalData || []) as GasTerminal[]);
          }
        }
      } catch (error: any) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [showPlants, showTerminals]);

  // 필터링된 발전소
  const filteredPlants = plants.filter(plant => {
    const typeMatch = plantTypeFilter === 'all' || plant.type === plantTypeFilter;
    const statusMatch = statusFilter === 'all' || plant.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // 필터링된 터미널
  const filteredTerminals = terminals.filter(terminal => {
    const categoryMatch = terminalCategoryFilter === 'all' || terminal.category === terminalCategoryFilter;
    const statusMatch = statusFilter === 'all' || terminal.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  if (!isClient) {
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

  const allPoints = [
    ...filteredPlants.filter(p => p.latitude && p.longitude).map(p => ({ lat: p.latitude!, lng: p.longitude! })),
    ...filteredTerminals.filter(t => t.latitude && t.longitude).map(t => ({ lat: t.latitude!, lng: t.longitude! }))
  ];

  return (
    <div className="w-full h-full">
      {isClient && (
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
            .filter(p => p.latitude && p.longitude)
            .map((plant) => (
              <Marker
                key={`plant-${plant.id}`}
                position={[plant.latitude!, plant.longitude!]}
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
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            plant.status === '운영' ? 'bg-green-100 text-green-800' :
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
            .filter(t => t.latitude && t.longitude)
            .map((terminal) => (
              <Marker
                key={`terminal-${terminal.id}`}
                position={[terminal.latitude!, terminal.longitude!]}
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
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            terminal.status === '운영' ? 'bg-green-100 text-green-800' :
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

