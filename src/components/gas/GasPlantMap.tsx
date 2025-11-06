"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/src/lib/supabase";
import type { GasPlant } from "@/src/types/gasPlant";

// Leaflet 기본 아이콘 설정
const fixDefaultIcon = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
};

// 커스텀 마커 아이콘 생성
function createGasPlantIcon(plant: GasPlant) {
  const color = plant.type === '복합발전' ? '#2563eb' : '#059669';
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
  typeFilter?: '복합발전' | '열병합발전' | 'all';
  statusFilter?: '운영' | '건설' | '계획' | 'all';
  onPlantClick?: (plant: GasPlant) => void;
};

export default function GasPlantMap({ 
  typeFilter = 'all', 
  statusFilter = 'all',
  onPlantClick 
}: Props) {
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 렌더링되도록 확인
  useEffect(() => {
    setIsClient(true);
    fixDefaultIcon();
  }, []);

  useEffect(() => {
    async function loadPlants() {
      try {
        // Supabase 연결 확인
        if (!supabase) {
          console.error('Supabase client is not initialized');
          setLoading(false);
          return;
        }

        let query = supabase
          .from('gas_plants')
          .select('*')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        const { data, error } = await query;

        if (error) {
          console.error('Error loading gas plants:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
          });
          setPlants([]);
          setLoading(false);
          return;
        }

        const loadedCount = data?.length || 0;
        console.log(`GasPlantMap: Loaded ${loadedCount} plants with coordinates`);
        
        if (loadedCount === 0) {
          console.warn('GasPlantMap: No plants with coordinates found');
        }
        
        setPlants((data || []) as GasPlant[]);
      } catch (error: any) {
        console.error('Error loading gas plants:', {
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          error: error
        });
        setPlants([]);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, []);

  // 필터링된 발전소
  const filteredPlants = plants.filter(plant => {
    const typeMatch = typeFilter === 'all' || plant.type === typeFilter;
    const statusMatch = statusFilter === 'all' || plant.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // 클라이언트 사이드에서만 지도 렌더링
  if (!isClient || loading) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        {!isClient ? '지도를 초기화하는 중...' : '데이터를 불러오는 중...'}
      </div>
    );
  }

  const points = filteredPlants
    .filter(p => p.latitude && p.longitude)
    .map(p => ({ lat: p.latitude!, lng: p.longitude! }));

  return (
    <div className="w-full h-full">
      <MapContainer
        center={[36.5, 127.8]}
        zoom={7}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        scrollWheelZoom={true}
        key={isClient ? 'map' : 'map-placeholder'} // 클라이언트 사이드에서만 렌더링되도록 키 추가
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.length > 0 && <FitToMarkers points={points} />}
        {filteredPlants
          .filter(p => p.latitude && p.longitude)
          .map((plant) => (
            <Marker
              key={plant.id}
              position={[plant.latitude!, plant.longitude!]}
              icon={createGasPlantIcon(plant)}
              eventHandlers={{
                click: () => onPlantClick?.(plant),
              }}
            >
              <Popup>
                <div className="min-w-[250px]">
                  <div className="font-bold text-base mb-2">{plant.plant_name}</div>
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
                    {plant.unit_number && (
                      <div><strong>호기:</strong> {plant.unit_number}호기</div>
                    )}
                    {plant.location && (
                      <div><strong>위치:</strong> {plant.location}</div>
                    )}
                    {plant.operation_start && plant.operation_start !== '-' && (
                      <div><strong>가동:</strong> {plant.operation_start.split(' ')[0]}</div>
                    )}
                    {plant.note && (
                      <div className="mt-2 text-xs text-gray-600">{plant.note}</div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

