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

/**
 * IntegratedGasMap 컴포넌트를 동적으로 로드합니다.
 * 'ssr: false' 옵션은 서버 사이드 렌더링을 비활성화하여,
 * 브라우저 환경(window 객체 등)이 필요한 지도 라이브러리(Leaflet)가
 * 클라이언트 측에서만 로드되도록 보장합니다.
 */
const IntegratedGasMap = dynamic(() => import("@/src/components/gas/IntegratedGasMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
      지도를 불러오는 중...
    </div>
  ),
});

export default function Home() {
  // 컴포넌트 마운트 상태 관리 (클라이언트 사이드 렌더링 확인용)
  const [mounted, setMounted] = useState(false);

  // 데이터 상태 관리
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [terminals, setTerminals] = useState<GasTerminal[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터 상태 관리
  const [showPlants, setShowPlants] = useState(true);
  const [showTerminals, setShowTerminals] = useState(true);
  const [plantTypeFilter, setPlantTypeFilter] = useState<'복합발전' | '열병합발전' | 'all'>('all');
  const [terminalCategoryFilter, setTerminalCategoryFilter] = useState<'가스공사' | '민간' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'운영' | '건설' | '계획' | 'all'>('all');

  // 데이터 업로드 관련 상태
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

  /**
   * HTML 엔티티(예: &amp;, &lt;)를 일반 문자로 변환합니다.
   * 브라우저 환경에서만 동작하도록 window 객체 확인을 수행합니다.
   */
  const decodeHtmlEntities = (text: string): string => {
    if (typeof window === 'undefined') return text;
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  /**
   * 문자열에서 HTML 태그를 제거하여 순수 텍스트만 추출합니다.
   * 뉴스 미리보기 등에서 태그 없이 텍스트만 보여줄 때 사용합니다.
   */
  const stripHtmlTags = (html: string): string => {
    if (typeof window === 'undefined') return html;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  /**
   * 컴포넌트가 마운트되었음을 표시합니다.
   * Hydration Mismatch 오류를 방지하기 위해 사용됩니다.
   */
  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * 초기 데이터를 로드하는 Effect입니다.
   * 발전소 및 터미널 정보, 뉴스 통계를 Supabase에서 가져옵니다.
   */
  useEffect(() => {
    async function loadData() {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        // 발전소 데이터 로드
        const { data: plantData } = await supabase
          .from('gas_plants')
          .select('*')
          .order('plant_name');

        // 터미널 데이터 로드
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
        // 승인된 뉴스 기사의 위치 유형만 조회하여 통계 계산
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

  /**
   * 전체 뉴스 목록을 로드합니다.
   * 필터 조건(위치 유형)에 따라 쿼리를 동적으로 구성합니다.
   */
  const loadAllNews = async () => {
    setLoadingNews(true);
    try {
      let query = supabase
        .from('articles')
        .select('*')
        .eq('status', 'approved')
        .order('published_at', { ascending: false })
        .limit(50);

      // 선택된 위치 유형 필터가 있다면 쿼리에 조건 추가
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
    <div className="min-h-screen bg-gray-50/50">


      {/* 메인 컨텐츠 */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* 지도 섹션 - 메인 */}
          <div className="lg:col-span-9 flex flex-col gap-4 animate-fade-in-up">
            <Card className="h-[60vh] lg:h-[calc(100vh-10rem)] overflow-hidden rounded-3xl border-0 shadow-2xl shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 transition-all duration-500">
              <CardHeader className="px-6 py-4 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <CardTitle className="text-base font-semibold text-slate-800">실시간 시설 현황</CardTitle>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
                      <div className="w-2 h-2 bg-black rounded-full"></div>
                      <span>복합발전</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                      <span>열병합</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-700">가스공사</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-50">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-700">민간터미널</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-3.5rem)] relative bg-slate-50">
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
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600"></div>
                      <span className="text-sm font-medium">지도를 불러오는 중...</span>
                    </div>
                  )}
                </div>
                {/* 지도 컨트롤 - 플로팅 버튼 스타일 */}
                <div className="absolute top-4 right-4 z-[400]">
                  <button
                    onClick={() => {
                      setShowAllNews(!showAllNews);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 ${showAllNews
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 ring-2 ring-slate-900 ring-offset-2'
                      : 'bg-white text-slate-700 shadow-lg hover:bg-slate-50 hover:scale-105'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    <span>뉴스 보기</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-3 space-y-6 h-full overflow-y-auto pr-1 custom-scrollbar">
            {/* 통계 카드 */}
            <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden animate-fade-in-up delay-100 hover-lift">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  전체 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-slate-500">총 등록 시설</span>
                  <span className="text-2xl font-bold text-slate-900">{stats.total}<span className="text-sm font-normal text-slate-400 ml-1">개</span></span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700">발전소</span>
                      <span className="text-xs font-bold text-slate-900">{stats.plants.total}개</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>복합</span>
                        <span className="font-medium text-slate-700">{stats.plants.complex}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>열병합</span>
                        <span className="font-medium text-slate-700">{stats.plants.cogen}</span>
                      </div>
                      <div className="col-span-2 flex justify-between pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-500">총 용량</span>
                        <span className="font-medium text-slate-900">{stats.plants.totalCapacity.toLocaleString()} MW</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-700">터미널</span>
                      <span className="text-xs font-bold text-slate-900">{stats.terminals.total}개</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>가스공사</span>
                        <span className="font-medium text-red-600">{stats.terminals.kogas}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>민간</span>
                        <span className="font-medium text-orange-600">{stats.terminals.private}</span>
                      </div>
                      <div className="col-span-2 flex justify-between pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-500">저장용량</span>
                        <span className="font-medium text-slate-900">{stats.terminals.totalCapacity.toLocaleString()} kL</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 필터 카드 */}
            <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden animate-fade-in-up delay-200 hover-lift">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  필터 설정
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-2 block">표시 시설</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${showPlants
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                      <input
                        type="checkbox"
                        checked={showPlants}
                        onChange={(e) => setShowPlants(e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-xs font-medium">발전소</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${showTerminals
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                      <input
                        type="checkbox"
                        checked={showTerminals}
                        onChange={(e) => setShowTerminals(e.target.checked)}
                        className="hidden"
                      />
                      <span className="text-xs font-medium">터미널</span>
                    </label>
                  </div>
                </div>

                {showPlants && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">발전소 유형</label>
                    <Select
                      value={plantTypeFilter}
                      onValueChange={(value) => setPlantTypeFilter(value as any)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 보기</SelectItem>
                        <SelectItem value="복합발전">복합발전</SelectItem>
                        <SelectItem value="열병합발전">열병합발전</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showTerminals && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                    <label className="text-xs font-semibold text-slate-500 mb-1.5 block">터미널 분류</label>
                    <Select
                      value={terminalCategoryFilter}
                      onValueChange={(value) => setTerminalCategoryFilter(value as any)}
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 보기</SelectItem>
                        <SelectItem value="가스공사">한국가스공사</SelectItem>
                        <SelectItem value="민간">민간 터미널</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1.5 block">운영 상태</label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value as any)}
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200 focus:ring-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 상태</SelectItem>
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
              <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden animate-fade-in-up delay-300 hover-lift">
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
                    <div className={`text-xs p-2 rounded ${uploadResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                      {uploadResult.message}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}


            {/* 뉴스 현황 카드 */}
            <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden animate-fade-in-up delay-400 hover-lift">
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
          <div className="mt-8 animate-fade-in-up delay-500">
            <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-slate-900"></div>
                  필터링된 시설 목록 <span className="text-slate-400 font-normal text-sm ml-1">({filteredPlants.length + filteredTerminals.length}개)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-slate-50/50">
                <div className="space-y-8">
                  {/* 발전소 목록 */}
                  {showPlants && filteredPlants.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-slate-900 rounded-full"></span>
                        발전소 ({filteredPlants.length}개)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {filteredPlants.map((plant) => {
                          const isComplex = plant.type === '복합발전';
                          return (
                            <div
                              key={plant.id}
                              className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{plant.plant_name}</h4>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${isComplex ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                  {plant.type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">소유주</span>
                                  <span className="font-medium text-slate-700">{plant.owner}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">용량</span>
                                  <span className="font-medium text-slate-900">{plant.capacity_mw?.toLocaleString()} MW</span>
                                </div>
                                {plant.status && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">상태</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${plant.status === '운영' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      plant.status === '건설' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                      }`}>
                                      {plant.status}
                                    </span>
                                  </div>
                                )}
                                {plant.location && (
                                  <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-slate-400">위치</span>
                                    <span className="font-medium text-slate-600 truncate max-w-[120px]" title={plant.location}>{plant.location}</span>
                                  </div>
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
                      <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1 h-4 bg-slate-900 rounded-full"></span>
                        터미널 ({filteredTerminals.length}개)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                        {filteredTerminals.map((terminal) => {
                          const isKogas = terminal.category === '가스공사';
                          return (
                            <div
                              key={terminal.id}
                              className="group bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-slate-300 transition-all duration-200"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">{terminal.terminal_name}</h4>
                                <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${isKogas ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-orange-50 text-orange-700 border border-orange-100'
                                  }`}>
                                  {terminal.category}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 space-y-1.5">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">소유주</span>
                                  <span className="font-medium text-slate-700">{terminal.owner}</span>
                                </div>
                                {terminal.capacity_kl && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">저장용량</span>
                                    <span className="font-medium text-slate-900">{terminal.capacity_kl.toLocaleString()} <span className="text-slate-400 font-normal">만kl</span></span>
                                  </div>
                                )}
                                {terminal.tank_number && (
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">탱크</span>
                                    <span className="font-medium text-slate-700">{terminal.tank_number}호기</span>
                                  </div>
                                )}
                                {terminal.status && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-slate-400">상태</span>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${terminal.status === '운영' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                      terminal.status === '건설' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                        'bg-blue-50 text-blue-700 border border-blue-100'
                                      }`}>
                                      {terminal.status}
                                    </span>
                                  </div>
                                )}
                                {terminal.location && (
                                  <div className="flex justify-between pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-slate-400">위치</span>
                                    <span className="font-medium text-slate-600 truncate max-w-[120px]" title={terminal.location}>{terminal.location}</span>
                                  </div>
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
          <div className="mt-8 animate-fade-in-up delay-500">
            <Card className="border-0 shadow-lg shadow-slate-900/5 glass-card ring-1 ring-slate-900/5 rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                    관련 뉴스
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select
                      value={newsFilter.locationType || 'all'}
                      onValueChange={(value) => setNewsFilter(prev => ({
                        ...prev,
                        locationType: value === 'all' ? undefined : value as any
                      }))}
                    >
                      <SelectTrigger className="w-32 h-9 text-xs bg-white border-slate-200 focus:ring-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체 보기</SelectItem>
                        <SelectItem value="national">전국 뉴스</SelectItem>
                        <SelectItem value="regional">지역 뉴스</SelectItem>
                        <SelectItem value="power_plant">발전소 뉴스</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllNews(false)}
                      className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      닫기
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 bg-slate-50/50">
                {loadingNews ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-slate-600"></div>
                    <span className="text-sm font-medium text-slate-500">뉴스를 불러오는 중...</span>
                  </div>
                ) : allNews.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">
                    <p className="text-sm">표시할 뉴스가 없습니다.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {allNews.map((news) => (
                      <div key={news.id} className="bg-white p-5 hover:bg-slate-50 transition-colors group">
                        <div className="flex flex-col h-full">
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${news.location_type === 'national' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                              news.location_type === 'regional' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                'bg-purple-50 text-purple-700 border border-purple-100'
                              }`}>
                              {news.location_type === 'national' ? '전국' :
                                news.location_type === 'regional' ? '지역' : '발전소'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(news.published_at).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {decodeHtmlEntities(news.title)}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-3 mb-4 flex-1 leading-relaxed">
                            {stripHtmlTags(decodeHtmlEntities(news.content || '')).substring(0, 150)}...
                          </p>
                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                            {news.si_do && news.si_gun_gu ? (
                              <div className="text-xs text-slate-500 flex items-center gap-1">
                                <span>📍</span> {news.si_do} {news.si_gun_gu}
                              </div>
                            ) : (
                              <div></div>
                            )}
                            <button
                              onClick={() => window.open(news.url, '_blank')}
                              className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
                            >
                              원문 보기
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
