"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import "leaflet.markercluster";
import { useEffect, useRef } from "react";

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
    const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

    useEffect(() => {
      if (!map || !clusterMarkers) return;

      // 마커 클러스터 그룹 생성
      const markerClusterGroup = L.markerClusterGroup({
        maxClusterRadius: 50, // 클러스터링 반경
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster) => {
          const childCount = cluster.getChildCount();
          let className = 'marker-cluster-';
          
          if (childCount < 10) {
            className += 'small';
          } else if (childCount < 100) {
            className += 'medium';
          } else {
            className += 'large';
          }

          return L.divIcon({
            html: `<div><span>${childCount}</span></div>`,
            className: `marker-cluster ${className}`,
            iconSize: L.point(40, 40)
          });
        }
      });

      // 각 마커를 클러스터 그룹에 추가
      clusterMarkers.forEach((m) => {
        const marker = L.marker([m.lat, m.lng], {
          icon: createPlantTypeIcon(m.plant_type, m.fuel_type, m.title)
        });

        // 팝업 내용 생성
        const popupContent = `
          <div class="space-y-2 min-w-[200px]">
            <div class="font-semibold text-lg">${m.title}</div>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">분류:</span>
                <span class="font-medium">${getPlantCategory(m.plant_type, m.fuel_type, m.title)}</span>
              </div>
              ${m.fuel_type ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">연료:</span>
                  <span class="font-medium text-gray-800">${m.fuel_type}</span>
                </div>
              ` : ''}
              <div class="flex justify-between">
                <span class="text-gray-600">상태:</span>
                <span class="font-medium">${m.status || '미정'}</span>
              </div>
              ${m.capacity_mw ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">용량:</span>
                  <span class="font-medium">${m.capacity_mw} MW</span>
                </div>
              ` : ''}
              ${m.operator ? `
                <div class="flex justify-between">
                  <span class="text-gray-600">사업자:</span>
                  <span class="font-medium">${m.operator}</span>
                </div>
              ` : ''}
            </div>
            <div class="pt-2 border-t">
              <a 
                href="/powerplant/${m.id}"
                class="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                상세 정보 보기 →
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markerClusterGroup.addLayer(marker);
      });

      map.addLayer(markerClusterGroup);
      clusterGroupRef.current = markerClusterGroup;

      // 클린업
      return () => {
        if (clusterGroupRef.current) {
          map.removeLayer(clusterGroupRef.current);
        }
      };
    }, [map, clusterMarkers]);

    return null;
  }

  return (
    <div className={className ?? "w-full h-[480px] rounded-md border"}>
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
  );
}


