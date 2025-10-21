"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef, useState } from "react";
import PlantOverlay from "../PlantOverlay";

// 발전원 분류 함수 (연료 기반)
function getPlantCategory(plantType: string | undefined, fuelType: string | undefined, name: string) {
  const type = plantType?.toLowerCase() || '';
  const fuel = fuelType?.toLowerCase() || '';
  const plantName = name.toLowerCase();
  
  // 원자력
  if (type.includes('원자력') || fuel.includes('농축u') || fuel.includes('천연u')) {
    return '원자력';
  }
  
  // 열병합 (집단에너지)
  if (plantName.includes('열병합') || plantName.includes('집단에너지') || type.includes('집단에너지')) {
    return '열병합';
  }
  
  // 석탄
  if (fuel.includes('유연탄') || fuel.includes('무연탄') || fuel.includes('역청탄')) {
    return '석탄';
  }
  
  // LNG
  if (fuel.includes('lng')) {
    return 'LNG';
  }
  
  // 경유
  if (fuel.includes('경유')) {
    return '경유';
  }
  
  // 기타화력 (중유, 바이오중유, 유류 등)
  if (fuel.includes('중유') || fuel.includes('바이오') || fuel.includes('유류') || 
      type.includes('기력') || type.includes('내연력') || type.includes('복합')) {
    return '기타화력';
  }
  
  return '기타';
}

// 발전원별 아이콘 생성 함수
function createPlantTypeIcon(plantType: string | undefined, fuelType: string | undefined, name: string) {
  const category = getPlantCategory(plantType, fuelType, name);
  
  const colors = {
    '석탄': '#111827',     // 검정
    'LNG': '#DC2626',      // 빨간색
    '경유': '#D97706',     // 주황-갈색
    '기타화력': '#EA580C', // 주황색
    '원자력': '#9333EA',   // 보라색
    '열병합': '#EC4899',   // 분홍색
    '기타': '#6B7280'      // 회색
  };
  
  const labels = {
    '석탄': '탄',
    'LNG': 'L',
    '경유': '경',
    '기타화력': '화',
    '원자력': '원',
    '열병합': '열',
    '기타': '?'
  };
  
  const color = colors[category as keyof typeof colors] || '#6B7280';
  const label = labels[category as keyof typeof labels] || '?';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: ${color};
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">${label}</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

// Fix default icon paths in Next.js
function fixDefaultIcon() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

type Props = {
  className?: string;
  center?: { lat: number; lng: number };
  markers?: Array<{ 
    id: string; 
    lat: number; 
    lng: number; 
    title: string;
    status?: string;
    capacity_mw?: number;
    operator?: string;
    plant_type?: string;
    fuel_type?: string;
  }>;
  zoom?: number;
};

export default function LeafletMap({ className, center, markers, zoom = 7 }: Props) {
  useEffect(() => {
    fixDefaultIcon();
  }, []);

  const c = center ?? { lat: 36.5, lng: 127.8 };
  const [selectedPlant, setSelectedPlant] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  console.log("LeafletMap props:", { center: c, markers: markers?.length, zoom });

  // 마커를 그대로 사용 (오프셋 없음)
  const markersWithOffset = markers || [];

  function FitToMarkers({ points }: { points: Array<{ lat: number; lng: number }> }) {
    const map = useMap();
    useEffect(() => {
      if (!points || points.length === 0) return;
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [32, 32] });
    }, [map, points]);
    return null;
  }

  function MarkerClusterGroup({ markers: clusterMarkers }: { markers: typeof markersWithOffset }) {
    const map = useMap();
    const clusterGroupsRef = useRef<L.MarkerClusterGroup[]>([]);

    useEffect(() => {
      if (!map || !clusterMarkers) return;

      // 기존 클러스터 그룹들 제거
      clusterGroupsRef.current.forEach(group => {
        map.removeLayer(group);
      });
      clusterGroupsRef.current = [];

      // 단일 클러스터 그룹으로 단순화 (메모리 효율성)
      const markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          const markers = cluster.getAllChildMarkers();
          
          // 클러스터 내 발전소 종류 분석
          const categoryCounts: Record<string, number> = {};
          markers.forEach((marker: any) => {
            const m = clusterMarkers.find(cm => 
              Math.abs(cm.lat - marker.getLatLng().lat) < 0.0001 && 
              Math.abs(cm.lng - marker.getLatLng().lng) < 0.0001
            );
            if (m) {
              const category = getPlantCategory(m.plant_type, m.fuel_type, m.title);
              categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            }
          });
          
          // 가장 많은 종류 찾기
          let dominantCategory = '기타';
          let maxCount = 0;
          Object.entries(categoryCounts).forEach(([category, count]) => {
            if (count > maxCount) {
              maxCount = count;
              dominantCategory = category;
            }
          });
          
          // 색상 매핑
          const colors: Record<string, string> = {
            '석탄': '#111827',
            'LNG': '#DC2626',
            '경유': '#D97706',
            '기타화력': '#EA580C',
            '원자력': '#9333EA',
            '열병합': '#EC4899',
            '기타': '#6B7280'
          };
          
          const color = colors[dominantCategory] || '#6B7280';
          
          // 크기 결정 (개수에 따라)
          let size = 30;
          if (childCount >= 50) {
            size = 50;
          } else if (childCount >= 20) {
            size = 40;
          } else if (childCount >= 10) {
            size = 35;
          }
          
          return L.divIcon({
            html: `<div style="
              background-color: ${color};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: ${size > 40 ? '14px' : '12px'};
              font-weight: bold;
            "><span>${childCount}</span></div>`,
            className: 'custom-cluster-icon',
            iconSize: L.point(size, size),
            iconAnchor: [size / 2, size / 2]
          });
        }
      });

      // 모든 마커를 단일 클러스터 그룹에 추가
      clusterMarkers.forEach((m) => {
        const marker = L.marker([m.lat, m.lng], {
          icon: createPlantTypeIcon(m.plant_type, m.fuel_type, m.title)
        });

        // 마커 클릭 이벤트 추가
        marker.on('click', () => {
          setSelectedPlant({
            id: m.id,
            name: m.title,
            address: m.address,
            status: m.status,
            capacity_mw: m.capacity_mw,
            operator: m.operator,
            plant_type: m.plant_type,
            fuel_type: m.fuel_type,
            latitude: m.lat,
            longitude: m.lng
          });
        });

        // 팝업 내용 생성 (기존 팝업은 유지하되 간소화)
        const popupContent = `
          <div class="space-y-2 min-w-[200px]">
            <div class="font-semibold text-lg">${m.title}</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">분류:</span>
                <span class="font-medium">${getPlantCategory(m.plant_type, m.fuel_type, m.title)}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">상태:</span>
                <span class="font-medium">${m.status || '미정'}</span>
              </div>
            </div>
            <div class="pt-2 border-t">
              <button 
                onclick="window.dispatchEvent(new CustomEvent('markerClick', { detail: { plantId: '${m.id}' } }))"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                상세 정보 보기 →
              </button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markerClusterGroup.addLayer(marker);
      });

      map.addLayer(markerClusterGroup);
      clusterGroupsRef.current.push(markerClusterGroup);

      // 클린업
      return () => {
        clusterGroupsRef.current.forEach(group => {
          map.removeLayer(group);
        });
        clusterGroupsRef.current = [];
      };
    }, [map, clusterMarkers]);

    return null;
  }

  return (
    <>
      <div className={`${className ?? "w-full h-[480px] rounded-md border"} relative z-10`}>
        <MapContainer 
          center={[c.lat, c.lng]} 
          zoom={zoom} 
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            crossOrigin={true}
            referrerPolicy="no-referrer-when-downgrade"
          />
          {markersWithOffset && markersWithOffset.length > 0 ? (
            <FitToMarkers points={markersWithOffset.map((m) => ({ lat: m.lat, lng: m.lng }))} />
          ) : null}
          <MarkerClusterGroup markers={markersWithOffset} />
        </MapContainer>
      </div>
      
      {/* 발전소 오버레이 */}
      <PlantOverlay 
        plant={selectedPlant} 
        onClose={() => setSelectedPlant(null)} 
        isMobile={isMobile}
      />
    </>
  );
}


