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

export default function MapSection() {
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

  console.log("Rendering map with markers:", markers.length);

  return (
    <div className="w-full h-[480px] rounded-md border">
      <LeafletMap className="w-full h-full" markers={markers} />
    </div>
  );
}


