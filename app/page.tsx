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
    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
      지도를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [terminals, setTerminals] = useState<GasTerminal[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 필터 상태
  const [showPlants, setShowPlants] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [plantTypeFilter, setPlantTypeFilter] = useState<'복합발전' | '열병합발전' | 'all'>('all');
  const [terminalCategoryFilter, setTerminalCategoryFilter] = useState<'가스공사' | '민간' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'운영' | '건설' | '계획' | 'all'>('all');

  // 업로드 상태
  const [uploadingPlants, setUploadingPlants] = useState(false);
  const [uploadingTerminals, setUploadingTerminals] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);

  // 뉴스 관련 상태
  const [showAllNews, setShowAllNews] = useState(false);
  const [newsFilter, setNewsFilter] = useState<{
    locationType?: 'national' | 'regional' | 'power_plant';
  }>({});
  const [allNews, setAllNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [newsStats, setNewsStats] = useState({
    national: 0,
    regional: 0,
    powerPlant: 0,
    total: 0
  });

  // HTML 엔티티 디코딩 함수
  const decodeHtmlEntities = (text: string): string => {
    if (typeof window === 'undefined') return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // HTML 태그 제거 함수
  const stripHtmlTags = (html: string): string => {
    if (typeof window === 'undefined') return html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

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

    async function loadNewsStats() {
      try {
        const { data, error } = await supabase
          .from("articles")
          .select("location_type")
          .eq("status", "approved");

        if (error) {
          console.error("Error loading news stats:", error);
          return;
        }

        const stats = {
          national: (data || []).filter(article => article.location_type === 'national').length,
          regional: (data || []).filter(article => article.location_type === 'regional').length,
          powerPlant: (data || []).filter(article => article.location_type === 'power_plant').length,
          total: (data || []).length
        };
        setNewsStats(stats);
      } catch (err) {
        console.error("Error loading news stats:", err);
      }
    }

    loadData();
    loadNewsStats();
  }, []);

  // 뉴스 로드 함수
  const loadAllNews = async () => {
    setLoadingNews(true);
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(50);

      // 필터 적용
      if (newsFilter.locationType) {
        query = query.eq('location_type', newsFilter.locationType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading news:', error);
        return;
      }

      setAllNews(data || []);
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  // 뉴스 필터 변경 시 로드
  useEffect(() => {
    if (showAllNews) {
      loadAllNews();
    }
  }, [showAllNews, newsFilter]);

  // 발전소 데이터 업로드
  const handlePlantsUpload = async () => {
    setUploadingPlants(true);
    setUploadResult(null);
    try {
      const response = await fetch('/api/gas-plants/upload', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        setUploadResult({
          success: true,
          message: `발전소 ${result.summary.success}개 업로드 완료`,
        });
        // 데이터 재로드
        const { data: plantData } = await supabase
          .from('gas_plants')
          .select('*')
          .order('plant_name');
        setPlants((plantData || []) as GasPlant[]);
      } else {
        setUploadResult({
          success: false,
          message: result.error || '업로드 실패',
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || '업로드 중 오류 발생',
      });
    } finally {
      setUploadingPlants(false);
    }
  };

  // 터미널 데이터 업로드
  const handleTerminalsUpload = async () => {
    setUploadingTerminals(true);
    setUploadResult(null);
    try {
      const response = await fetch('/api/gas-terminals/upload', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        setUploadResult({
          success: true,
          message: `터미널 ${result.summary.success}개 업로드 완료`,
        });
        // 데이터 재로드
        const { data: terminalData } = await supabase
          .from('gas_terminals')
          .select('*')
          .order('terminal_name');
        setTerminals((terminalData || []) as GasTerminal[]);
      } else {
        setUploadResult({
          success: false,
          message: result.error || '업로드 실패',
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || '업로드 중 오류 발생',
      });
    } finally {
      setUploadingTerminals(false);
    }
  };

  // 좌표가 없는 항목 geocoding
  const handleGeocodeMissing = async () => {
    setUploadingPlants(true);
    setUploadResult(null);
    try {
      const response = await fetch('/api/gas-plants/geocode-missing', {
        method: 'POST',
      });
      const result = await response.json();
      
      if (result.success) {
        const geocodedCount = result.summary?.geocoded || 0;
        const failedCount = result.summary?.failed || 0;
        const totalCount = result.summary?.total || 0;
        
        let message = '';
        if (geocodedCount > 0) {
          message = `${geocodedCount}개 항목의 좌표를 자동으로 추가했습니다.`;
          if (failedCount > 0) {
            message += ` (실패: ${failedCount}개)`;
          }
        } else if (totalCount === 0) {
          message = '좌표가 필요한 항목이 없습니다.';
        } else {
          message = `좌표 추가에 실패했습니다. (실패: ${failedCount}개)`;
        }
        
        setUploadResult({
          success: geocodedCount > 0,
          message,
        });
        
        // 데이터 재로드
        const { data: plantData } = await supabase
          .from('gas_plants')
          .select('*')
          .order('plant_name');
        setPlants((plantData || []) as GasPlant[]);
      } else {
        setUploadResult({
          success: false,
          message: result.error || 'Geocoding 실패',
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || 'Geocoding 중 오류 발생',
      });
    } finally {
      setUploadingPlants(false);
    }
  };

  // 필터링된 발전소
  const filteredPlants = plants.filter(plant => {
    if (!showPlants) return false;
    const typeMatch = plantTypeFilter === 'all' || plant.type === plantTypeFilter;
    const statusMatch = statusFilter === 'all' || plant.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // 필터링된 터미널
  const filteredTerminals = terminals.filter(terminal => {
    if (!showTerminals) return false;
    const categoryMatch = terminalCategoryFilter === 'all' || terminal.category === terminalCategoryFilter;
    const statusMatch = statusFilter === 'all' || terminal.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  // 통계 계산
  const stats = {
    plants: {
      total: plants.length,
      complex: plants.filter(p => p.type === '복합발전').length,
      cogen: plants.filter(p => p.type === '열병합발전').length,
      totalCapacity: plants.reduce((sum, p) => sum + (p.capacity_mw || 0), 0),
      operating: plants.filter(p => p.status === '운영').length,
    },
    terminals: {
      total: terminals.length,
      kogas: terminals.filter(t => t.category === '가스공사').length,
      private: terminals.filter(t => t.category === '민간').length,
      totalCapacity: terminals.reduce((sum, t) => sum + (t.capacity_kl || 0), 0),
      operating: terminals.filter(t => t.status === '운영').length,
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
              <h1 className="text-xl font-bold text-gray-900">LNG 발전소 현황</h1>
              <p className="text-sm text-gray-600">발전소 및 터미널 통합 지도</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/about">
              <Button variant="outline" size="sm">
                GasOut이란?
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" size="sm">
                관리자
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
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <span>복합발전</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
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
              <CardContent className="p-0 h-[calc(100%-4rem)] relative">
                <div className="h-full w-full">
                  {mounted ? (
                    <IntegratedGasMap
                      showPlants={showPlants}
                      showTerminals={showTerminals}
                      plantTypeFilter={plantTypeFilter}
                      terminalCategoryFilter={terminalCategoryFilter}
                      statusFilter={statusFilter}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                      지도를 초기화하는 중...
                    </div>
                  )}
                </div>
                {/* 지도 컨트롤 */}
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => {
                      setShowAllNews(!showAllNews);
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showAllNews 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } shadow-lg border`}
                  >
                    뉴스
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 통계 카드 */}
            <Card>
              <CardHeader className="pb-0 border-b-0">
                <CardTitle className="text-sm">전체 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0 -mt-px">
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
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">운영 중</span>
                      <span className="font-medium text-green-600">{stats.plants.operating}개</span>
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
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">운영 중</span>
                      <span className="font-medium text-green-600">{stats.terminals.operating}개</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 필터 카드 */}
            <Card>
              <CardHeader className="pb-0 border-b-0">
                <CardTitle className="text-sm">필터</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 pt-0 -mt-px">
                <div>
                  <label className="text-xs text-gray-600 mb-0 block">시설 유형</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showPlants}
                        onChange={(e) => setShowPlants(e.target.checked)}
                        className="rounded w-3.5 h-3.5"
                      />
                      <span>발전소</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={showTerminals}
                        onChange={(e) => setShowTerminals(e.target.checked)}
                        className="rounded w-3.5 h-3.5"
                      />
                      <span>터미널</span>
                    </label>
                  </div>
                </div>
                {showPlants && (
                  <div>
                    <label className="text-xs text-gray-600 mb-0 block">발전소 유형</label>
                    <Select
                      value={plantTypeFilter}
                      onValueChange={(value) => setPlantTypeFilter(value as any)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg border">
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="복합발전">복합발전</SelectItem>
                        <SelectItem value="열병합발전">열병합발전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {showTerminals && (
                  <div>
                    <label className="text-xs text-gray-600 mb-0 block">터미널 분류</label>
                    <Select
                      value={terminalCategoryFilter}
                      onValueChange={(value) => setTerminalCategoryFilter(value as any)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg border">
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="가스공사">가스공사</SelectItem>
                        <SelectItem value="민간">민간</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-600 mb-0 block">운영 상태</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as any)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white shadow-lg border">
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="운영">운영 중</SelectItem>
                      <SelectItem value="건설">건설 중</SelectItem>
                      <SelectItem value="계획">계획 중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 데이터 관리 카드 */}
            {(plants.length === 0 || terminals.length === 0) && (
              <Card>
                <CardHeader className="pb-0 border-b-0">
                  <CardTitle className="text-sm">데이터 관리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 -mt-px">
                  {plants.length === 0 && (
                    <Button
                      onClick={handlePlantsUpload}
                      disabled={uploadingPlants}
                      className="w-full text-xs h-7"
                      size="sm"
                    >
                      {uploadingPlants ? '업로드 중...' : '발전소 데이터 업로드'}
                    </Button>
                  )}
                  {terminals.length === 0 && (
                    <Button
                      onClick={handleTerminalsUpload}
                      disabled={uploadingTerminals}
                      className="w-full text-xs h-7"
                      size="sm"
                      variant="outline"
                    >
                      {uploadingTerminals ? '업로드 중...' : '터미널 데이터 업로드'}
                    </Button>
                  )}
                  {uploadResult && (
                    <div className={`text-xs p-2 rounded ${
                      uploadResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {uploadResult.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


            {/* 뉴스 현황 카드 */}
            <Card>
              <CardHeader className="pb-0 border-b-0">
                <CardTitle className="text-sm">뉴스 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0.5 pt-0 -mt-px">
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => {
                      setNewsFilter({});
                      setShowAllNews(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer text-left"
                  >
                    총 뉴스
                  </button>
                  <button
                    onClick={() => {
                      setNewsFilter({});
                      setShowAllNews(true);
                    }}
                    className="font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {newsStats.total}
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'national' });
                      setShowAllNews(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer text-left"
                  >
                    전국 뉴스
                  </button>
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'national' });
                      setShowAllNews(true);
                    }}
                    className="font-bold text-green-600 hover:text-green-800 hover:bg-green-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {newsStats.national}
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'regional' });
                      setShowAllNews(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer text-left"
                  >
                    지역 뉴스
                  </button>
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'regional' });
                      setShowAllNews(true);
                    }}
                    className="font-bold text-orange-600 hover:text-orange-800 hover:bg-orange-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {newsStats.regional}
                  </button>
                </div>
                <div className="flex justify-between text-sm">
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'power_plant' });
                      setShowAllNews(true);
                    }}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors cursor-pointer text-left"
                  >
                    발전소 뉴스
                  </button>
                  <button
                    onClick={() => {
                      setNewsFilter({ locationType: 'power_plant' });
                      setShowAllNews(true);
                    }}
                    className="font-bold text-purple-600 hover:text-purple-800 hover:bg-purple-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    {newsStats.powerPlant}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 필터링된 시설 목록 */}
        {(filteredPlants.length > 0 || filteredTerminals.length > 0) && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  필터링된 시설 목록 ({filteredPlants.length + filteredTerminals.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 발전소 목록 */}
                  {showPlants && filteredPlants.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        발전소 ({filteredPlants.length}개)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {filteredPlants.map((plant) => {
                          const color = plant.type === '복합발전' ? 'bg-black text-white' : 'bg-gray-600 text-white';
                          return (
                            <div
                              key={plant.id}
                              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm text-gray-900">{plant.plant_name}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${color}`}>
                                  {plant.type}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div><strong>소유주:</strong> {plant.owner}</div>
                                <div><strong>용량:</strong> {plant.capacity_mw?.toLocaleString()} MW</div>
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
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 터미널 목록 */}
                  {showTerminals && filteredTerminals.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        터미널 ({filteredTerminals.length}개)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                        {filteredTerminals.map((terminal) => {
                          const color = terminal.category === '가스공사' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
                          return (
                            <div
                              key={terminal.id}
                              className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm text-gray-900">{terminal.terminal_name}</h4>
                                <span className={`text-xs px-2 py-1 rounded ${color}`}>
                                  {terminal.category}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 space-y-1">
                                <div><strong>소유주:</strong> {terminal.owner}</div>
                                {terminal.capacity_kl && (
                                  <div><strong>저장용량:</strong> {terminal.capacity_kl.toLocaleString()} 만kl</div>
                                )}
                                {terminal.tank_number && (
                                  <div><strong>탱크:</strong> {terminal.tank_number}호기</div>
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
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 뉴스 패널 */}
        {showAllNews && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>뉴스</CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={newsFilter.locationType || 'all'}
                      onValueChange={(value) => setNewsFilter(prev => ({ 
                        ...prev, 
                        locationType: value === 'all' ? undefined : value as any 
                      }))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white shadow-lg border">
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="national">전국</SelectItem>
                        <SelectItem value="regional">지역</SelectItem>
                        <SelectItem value="power_plant">발전소</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllNews(false)}
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingNews ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-sm text-gray-600">뉴스를 불러오는 중...</span>
                  </div>
                ) : allNews.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">뉴스가 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {allNews.map((news) => (
                      <div key={news.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                news.location_type === 'national' ? 'bg-blue-100 text-blue-800' :
                                news.location_type === 'regional' ? 'bg-green-100 text-green-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {news.location_type === 'national' ? '전국' :
                                 news.location_type === 'regional' ? '지역' : '발전소'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(news.published_at).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">
                              {decodeHtmlEntities(news.title)}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                              {stripHtmlTags(decodeHtmlEntities(news.content || '')).substring(0, 150)}...
                            </p>
                            {news.si_do && news.si_gun_gu && (
                              <div className="text-xs text-gray-500">
                                📍 {news.si_do} {news.si_gun_gu}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => window.open(news.url, '_blank')}
                            className="flex-shrink-0 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          >
                            원문 보기
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
