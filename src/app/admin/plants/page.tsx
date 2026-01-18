"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Plus, Filter, Zap, LayoutDashboard, LogOut, MapPin, Activity, Factory, Leaf, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  const [searchTerm, setSearchTerm] = useState("");
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

  // 연료별 색상 (다크 모드용 밝은 색상)
  const categoryColors: Record<string, string> = {
    석탄: '#9ca3af', // Gray 400
    LNG: '#f87171', // Red 400
    기타화력: '#fbbf24', // Amber 400
    원자력: '#c084fc', // Purple 400
    기타: '#94a3b8', // Slate 400
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
          <div className="text-lg text-slate-400">발전소 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  const filteredPlants = plants.filter(plant =>
    plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plant.address.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-emerald-900/20 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-6 py-8">
        {/* 헤더 */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 shrink-0">
              <Factory className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">발전소 관리</h1>
              <p className="text-sm text-slate-400 mt-1">발전소 현황 조회 및 관리</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Link href="/admin/plants/new">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-0">
                <Plus className="w-4 h-4 mr-2" />
                새 발전소 추가
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard")}
              className="bg-slate-800/50 border-white/10 text-slate-300 hover:bg-slate-700/50 hover:text-white"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              대시보드
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* 검색 및 필터 */}
        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="발전소 이름 또는 주소 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-white/10 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {/* 발전소 목록 */}
        <Card className="glass-card border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10">
          <CardHeader className="border-b border-white/5 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-400" />
                발전소 목록 <span className="text-slate-500 text-sm font-normal ml-2">({filteredPlants.length}개)</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {filteredPlants.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                <Factory className="w-12 h-12 mb-4 opacity-20" />
                <p>등록된 발전소가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlants.map((plant) => {
                  const category = getPlantCategory(plant.plant_type, plant.fuel_type, plant.name);
                  const color = categoryColors[category] ?? '#9ca3af';
                  const isOperating = plant.status === '운영중';

                  return (
                    <div key={plant.id} className="group relative bg-slate-800/40 border border-white/5 rounded-xl p-5 hover:bg-slate-800/60 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0.5 border ${isOperating
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : plant.status === '건설중'
                                  ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                                  : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                              }`}>
                              {plant.status || '미정'}
                            </Badge>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-300 border border-white/5">
                              {plant.capacity_mw ? `${plant.capacity_mw}MW` : '용량 미정'}
                            </span>
                          </div>
                          <h4 className="font-bold text-lg text-white group-hover:text-emerald-400 transition-colors truncate pr-2">
                            {plant.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-950/50 px-2 py-1 rounded-md border border-white/5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                          <span className="text-xs text-slate-300 font-medium">{category}</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 text-sm text-slate-400 border-t border-white/5 pt-3">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{plant.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="truncate">{plant.plant_type} / {plant.fuel_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Factory className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="truncate">{plant.operator || '운영사 정보 없음'}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/plants/${plant.id}`} className="w-full">
                          <Button variant="ghost" size="sm" className="w-full h-8 text-xs bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200">
                            <Edit className="w-3 h-3 mr-1.5" />
                            상세 정보 수정
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
  );
}
