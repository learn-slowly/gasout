"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import MapSection from "@/src/components/map/MapSection";
import PowerPlantList from "@/src/components/PowerPlantList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type PowerPlant = {
  id: string;
  name: string;
  address: string;
  status: string | null;
  capacity_mw: number | null;
  operator: string | null;
  plant_type: string | null;
  fuel_type: string | null;
  latitude: number;
  longitude: number;
};

export default function Home() {
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [statusFilter, setStatusFilter] = useState("전체");
  const [plantTypeFilter, setPlantTypeFilter] = useState("전체");

  useEffect(() => {
    async function loadPlants() {
      const { data, error } = await supabase
        .from("power_plants")
        .select("id,name,address,status,capacity_mw,operator,plant_type,fuel_type,latitude,longitude")
        .order("name");

      if (error) {
        setError(error.message);
      } else {
        setPlants((data ?? []) as PowerPlant[]);
      }
      setLoading(false);
    }

    loadPlants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">로드 오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 - 미니멀하고 조밀한 디자인 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">전국 오염 발전소 현황</h1>
                <p className="text-xs text-gray-500">전국 발전소 위치 및 상태</p>
              </div>
            </div>
            <Link href="/admin/login">
              <Button variant="outline" size="sm" className="text-xs">
                관리자
              </Button>
            </Link>
          </div>
        </div>

        {/* 지도 섹션 - 조밀한 디자인 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-sm font-medium text-gray-900">발전소 위치</h2>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                  <span>석탄</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>LNG</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span>경유</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  <span>기타화력</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  <span>원자력</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                  <span>열병합</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-80">
            <MapSection 
              statusFilter={statusFilter} 
              plantTypeFilter={plantTypeFilter}
            />
          </div>
        </div>

        {/* 발전소 목록 - 카드 형태 */}
        <PowerPlantList 
          plants={plants}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          plantTypeFilter={plantTypeFilter}
          setPlantTypeFilter={setPlantTypeFilter}
        />

        {/* 통계 섹션 - 조밀한 디자인 */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-sm font-medium text-gray-900">발전소 현황</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{plants.length}</div>
                <div className="text-xs text-gray-600">총 발전소</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {plants.filter(p => p.status === '운영중').length}
                </div>
                <div className="text-xs text-gray-600">운영중</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {plants.filter(p => p.status === '건설중').length}
                </div>
                <div className="text-xs text-gray-600">건설중</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {plants.filter(p => p.status === '계획중').length}
                </div>
                <div className="text-xs text-gray-600">계획중</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
