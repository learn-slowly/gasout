"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/src/lib/supabase";
import type { GasPlant } from "@/src/types/gasPlant";
import type { GasTerminal } from "@/src/types/gasTerminal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const IntegratedGasMap = dynamic(() => import("@/src/components/gas/IntegratedGasMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] flex items-center justify-center text-sm text-gray-500">
      지도를 불러오는 중...
    </div>
  ),
});

export default function GasFacilitiesPage() {
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [terminals, setTerminals] = useState<GasTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlants, setShowPlants] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [plantTypeFilter, setPlantTypeFilter] = useState<'복합발전' | '열병합발전' | 'all'>('all');
  const [terminalCategoryFilter, setTerminalCategoryFilter] = useState<'가스공사' | '민간' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'운영' | '건설' | '계획' | 'all'>('all');

  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        // 발전소 로드
        const { data: plantData } = await supabase
          .from('gas_plants')
          .select('*')
          .order('plant_name');

        // 터미널 로드
        const { data: terminalData } = await supabase
          .from('gas_terminals')
          .select('*')
          .order('terminal_name');

        setPlants((plantData || []) as GasPlant[]);
        setTerminals((terminalData || []) as GasTerminal[]);
      } catch (error: any) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // 통계 계산
  const stats = {
    plants: {
      total: plants.length,
      complex: plants.filter(p => p.type === '복합발전').length,
      cogen: plants.filter(p => p.type === '열병합발전').length,
      totalCapacity: plants.reduce((sum, p) => sum + (p.capacity_mw || 0), 0),
    },
    terminals: {
      total: terminals.length,
      kogas: terminals.filter(t => t.category === '가스공사').length,
      private: terminals.filter(t => t.category === '민간').length,
      totalCapacity: terminals.reduce((sum, t) => sum + (t.capacity_kl || 0), 0),
    },
    total: plants.length + terminals.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">LNG 인프라 통합 지도</h1>
              <p className="text-sm text-gray-600">발전소 + 터미널 현황</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/gas-plants">
              <Button variant="outline" size="sm">
                발전소만
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                메인으로
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 지도 섹션 */}
          <div className="lg:col-span-3">
            <Card className="h-[60vh] lg:h-[calc(100vh-12rem)]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">시설 위치</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>복합발전</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>열병합</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>터미널(가스공사)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                      <span>터미널(민간)</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <div className="h-full w-full">
                  <IntegratedGasMap
                    showPlants={showPlants}
                    showTerminals={showTerminals}
                    plantTypeFilter={plantTypeFilter}
                    terminalCategoryFilter={terminalCategoryFilter}
                    statusFilter={statusFilter}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 통계 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">전체 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 시설</span>
                  <span className="font-bold text-gray-900">{stats.total}개</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">발전소</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">전체</span>
                      <span className="font-medium">{stats.plants.total}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">복합발전</span>
                      <span className="font-medium text-blue-600">{stats.plants.complex}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">열병합발전</span>
                      <span className="font-medium text-green-600">{stats.plants.cogen}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">총 용량</span>
                      <span className="font-medium">{stats.plants.totalCapacity.toLocaleString()} MW</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-medium text-gray-700 mb-2">터미널</div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">전체</span>
                      <span className="font-medium">{stats.terminals.total}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">가스공사</span>
                      <span className="font-medium text-red-600">{stats.terminals.kogas}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">민간</span>
                      <span className="font-medium text-orange-600">{stats.terminals.private}개</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">총 용량</span>
                      <span className="font-medium">{stats.terminals.totalCapacity.toLocaleString()} 만kl</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 필터 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">필터</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">시설 유형</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={showPlants}
                        onChange={(e) => setShowPlants(e.target.checked)}
                        className="rounded"
                      />
                      <span>발전소</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={showTerminals}
                        onChange={(e) => setShowTerminals(e.target.checked)}
                        className="rounded"
                      />
                      <span>터미널</span>
                    </label>
                  </div>
                </div>
                {showPlants && (
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">발전소 유형</label>
                    <Select
                      value={plantTypeFilter}
                      onValueChange={(value) => setPlantTypeFilter(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="복합발전">복합발전</SelectItem>
                        <SelectItem value="열병합발전">열병합발전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {showTerminals && (
                  <div>
                    <label className="text-xs text-gray-600 mb-2 block">터미널 분류</label>
                    <Select
                      value={terminalCategoryFilter}
                      onValueChange={(value) => setTerminalCategoryFilter(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="가스공사">가스공사</SelectItem>
                        <SelectItem value="민간">민간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">운영 상태</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="운영">운영 중</SelectItem>
                      <SelectItem value="건설">건설 중</SelectItem>
                      <SelectItem value="계획">계획 중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

