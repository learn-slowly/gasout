"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Marker = { 
  id: string; 
  lat: number; 
  lng: number; 
  title: string;
  status?: string;
  capacity_mw?: number;
  operator?: string;
  plant_type?: string;
  fuel_type?: string;
};

type Props = {
  statusFilter: string;
  plantTypeFilter: string;
};

export default function MapSection({ statusFilter, plantTypeFilter }: Props) {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const LeafletMap = dynamic(() => import("@/src/components/map/LeafletMap"), {
    ssr: false,
    loading: () => (
      <div className="w-full h-[480px] rounded-md border flex items-center justify-center text-sm text-gray-500">
        지도를 불러오는 중...
      </div>
    ),
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("power_plants")
          .select("id,name,latitude,longitude,status,capacity_mw,operator,plant_type,fuel_type")
          .not("latitude", "is", null)
          .not("longitude", "is", null);
        
        if (error) {
          console.error("Supabase error:", error);
          return;
        }
        
        if (!mounted) return;
        
        const pts: Marker[] = (data ?? []).map((p: any) => ({
          id: p.id,
          lat: Number(p.latitude),
          lng: Number(p.longitude),
          title: p.name as string,
          status: p.status as string,
          capacity_mw: p.capacity_mw as number,
          operator: p.operator as string,
          plant_type: p.plant_type as string,
          fuel_type: p.fuel_type as string,
        }));
        
        console.log("Loaded markers:", pts.length);
        setMarkers(pts);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading markers:", err);
        setIsLoading(false);
      }
    })();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[480px] rounded-md border flex items-center justify-center text-sm text-gray-500">
        발전소 데이터를 불러오는 중...
      </div>
    );
  }

  // 발전원 분류 함수
  const getPlantCategory = (marker: Marker) => {
    const plantType = marker.plant_type?.toLowerCase() || '';
    const fuelType = marker.fuel_type?.toLowerCase() || '';
    const name = marker.title.toLowerCase();
    
    if (plantType.includes('원자력') || fuelType.includes('농축u') || fuelType.includes('천연u')) {
      return '원자력';
    }
    
    if (name.includes('열병합') || name.includes('집단에너지') || plantType.includes('집단에너지')) {
      return '열병합';
    }
    
    if (fuelType.includes('유연탄') || fuelType.includes('무연탄') || fuelType.includes('역청탄')) {
      return '석탄';
    }
    
    if (fuelType.includes('lng')) {
      return 'LNG';
    }
    
    if (fuelType.includes('경유')) {
      return '경유';
    }
    
    if (fuelType.includes('중유') || fuelType.includes('바이오') || fuelType.includes('유류') || 
        plantType.includes('기력') || plantType.includes('내연력') || plantType.includes('복합')) {
      return '기타화력';
    }
    
    return '기타';
  };

  // 필터링된 마커
  const filteredMarkers = markers.filter(marker => {
    const statusMatch = statusFilter === "전체" || marker.status === statusFilter;
    const plantTypeMatch = plantTypeFilter === "전체" || getPlantCategory(marker) === plantTypeFilter;
    return statusMatch && plantTypeMatch;
  });

  console.log("Rendering map with markers:", filteredMarkers.length, "/ Total:", markers.length);

  return (
    <div className="w-full h-[480px] rounded-md border">
      <LeafletMap className="w-full h-full" markers={filteredMarkers} />
    </div>
  );
}


