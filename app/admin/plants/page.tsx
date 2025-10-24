"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function PlantsPage() {
  const [plants, setPlants] = useState<PowerPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadPlants();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      router.push("/admin/login");
      return;
    }
  };

  const loadPlants = async () => {
    try {
      const { data, error } = await supabase
        .from("power_plants")
        .select("*")
        .order("name");

      if (error) throw error;
      setPlants(data || []);
    } catch (error) {
      console.error("Error loading plants:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // 발전원 분류 함수
  const getPlantCategory = (
    plantType: string | null | undefined,
    fuelType: string | null | undefined,
    name: string | null | undefined
  ): '석탄' | 'LNG' | '기타화력' | '원자력' | '기타' => {
    const type = (plantType ?? '').toLowerCase();
    const fuel = (fuelType ?? '').toLowerCase();
    const plantName = (name ?? '').toLowerCase();

    // 원자력
    if (type.includes('원자력') || fuel.includes('농축u') || fuel.includes('천연u')) {
      return '원자력';
    }

    // 열병합/집단에너지는 연료별로 재분류
    if (plantName.includes('열병합') || plantName.includes('집단에너지') || type.includes('집단에너지')) {
      if (fuel.includes('유연탄') || fuel.includes('역청탄')) return '석탄';
      if (fuel.includes('lng')) return 'LNG';
      if (fuel.includes('중유') || fuel.includes('기타')) return '기타화력';
      return 'LNG';
    }

    // 석탄
    if (fuel.includes('유연탄') || fuel.includes('무연탄') || fuel.includes('역청탄')) {
      return '석탄';
    }

    // LNG
    if (fuel.includes('lng')) {
      return 'LNG';
    }

    // 기타화력 (경유/중유/바이오/유류 + 기력/내연력/복합 등)
    if (
      fuel.includes('경유') ||
      fuel.includes('중유') ||
      fuel.includes('바이오') ||
      fuel.includes('유류') ||
      type.includes('기력') ||
      type.includes('내연력') ||
      type.includes('복합')
    ) {
      return '기타화력';
    }

    return '기타';
  };

  // 연료별 색상
  const categoryColors: Record<string, string> = {
    석탄: '#111827',
    LNG: '#DC2626',
    기타화력: '#D97706',
    원자력: '#9333EA',
    기타: '#6B7280',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">발전소 관리</h1>
                <p className="text-xs text-gray-500">발전소 정보 관리</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/plants/new">
                <Button size="sm" className="text-xs">
                  새 발전소 추가
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/admin/dashboard")}
                className="text-xs"
              >
                대시보드
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-xs text-red-600 hover:bg-red-50"
              >
                로그아웃
              </Button>
            </div>
          </div>
        </div>

        {/* 발전소 목록 */}
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>발전소 목록 ({plants.length}개)</CardTitle>
            </CardHeader>
            <CardContent>
              {plants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  발전소가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {plants.map((plant) => {
                    const category = getPlantCategory(plant.plant_type, plant.fuel_type, plant.name);
                    const color = categoryColors[category] ?? '#6B7280';
                    return (
                      <div key={plant.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-gray-900">{plant.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] text-gray-800">
                              <span className="w-3 h-3 rounded-full border" style={{ backgroundColor: color, borderColor: color }} />
                              <span className="hidden sm:inline">{category}</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>위치: {plant.address}</div>
                          <div>용량: {plant.capacity_mw}MW</div>
                          <div>운영사: {plant.operator}</div>
                          <div>타입: {plant.plant_type} • {plant.fuel_type}</div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-block px-2 py-1 rounded text-xs ${
                              plant.status === '운영중' ? 'bg-green-100 text-green-800' :
                              plant.status === '건설중' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {plant.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Link href={`/admin/plants/${plant.id}`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              편집
                            </Button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
