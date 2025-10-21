"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";
import MapSection from "@/src/components/map/MapSection";
import PowerPlantList from "@/src/components/PowerPlantList";
import NewsMapControls from "@/src/components/map/NewsMapControls";
import NationalNewsPanel from "@/src/components/NationalNewsPanel";
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
  
  // 뉴스 관련 상태
  const [showPowerPlantInfo, setShowPowerPlantInfo] = useState(false);
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
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  // HTML 태그 제거 함수
  const stripHtmlTags = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  // 발전원 분류 함수 (지도와 동일한 기준 유지)
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

  // 지도 마커 색상과 동일한 팔레트
  const categoryColors: Record<string, string> = {
    석탄: '#111827',
    LNG: '#DC2626',
    기타화력: '#D97706',
    원자력: '#9333EA',
    기타: '#6B7280',
  };

  // 연료별 통계 계산
  const getFuelStats = () => {
    const stats = {
      석탄: { count: 0, capacity: 0 },
      LNG: { count: 0, capacity: 0 },
      기타화력: { count: 0, capacity: 0 },
      원자력: { count: 0, capacity: 0 },
      기타: { count: 0, capacity: 0 }
    };

    plants.forEach(plant => {
      if (plant.status === '운영중') {
        const category = getPlantCategory(plant.plant_type, plant.fuel_type, plant.name);
        stats[category].count++;
        stats[category].capacity += plant.capacity_mw || 0;
      }
    });

    return stats;
  };

  const fuelStats = getFuelStats();

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

    loadPlants();
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
      
      // 뉴스 통계 계산
      const stats = {
        national: (data || []).filter(article => article.location_type === 'national').length,
        regional: (data || []).filter(article => article.location_type === 'regional').length,
        powerPlant: (data || []).filter(article => article.location_type === 'power_plant').length,
        total: (data || []).length
      };
      setNewsStats(stats);
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
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">전국 발전소 현황</h1>
              <p className="text-sm text-gray-600">실시간 발전소 위치 및 뉴스 정보</p>
            </div>
          </div>
          <Link href="/admin/login">
            <Button variant="outline" size="sm">
              관리자
            </Button>
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 지도 섹션 */}
          <div className="lg:col-span-3 flex flex-col">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[60vh] lg:h-[calc(100vh-12rem)]">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
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
                      <span>기타화력</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span>원자력</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 relative min-h-0">
                <MapSection 
                  statusFilter={statusFilter} 
                  plantTypeFilter={plantTypeFilter}
                />
                
                {/* 지도 컨트롤 */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setShowPowerPlantInfo(!showPowerPlantInfo);
                      if (!showPowerPlantInfo) {
                        setShowAllNews(false);
                      }
                    }}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      showPowerPlantInfo 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } shadow-lg border`}
                  >
                    발전소 정보
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowAllNews(!showAllNews);
                      if (!showAllNews) {
                        setShowPowerPlantInfo(false);
                      }
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
              </div>
            </div>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 통계 카드 (모바일에서는 발전소 정보가 켜졌을 때만 표시) */}
            <div className={`bg-white border border-gray-200 rounded-lg p-4 ${showAllNews ? 'hidden lg:block' : ''}`}>
              <h3 className="text-sm font-medium text-gray-900 mb-3">발전소 현황</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 발전소</span>
                  <span className="font-bold text-blue-600">{plants.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">운영중</span>
                  <span className="font-bold text-green-600">{plants.filter(p => p.status === '운영중').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">건설중</span>
                  <span className="font-bold text-orange-600">{plants.filter(p => p.status === '건설중').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">계획중</span>
                  <span className="font-bold text-purple-600">{plants.filter(p => p.status === '계획중').length}</span>
                </div>
              </div>
              
              {/* 연료별 통계 */}
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h4 className="text-xs font-medium text-gray-700 mb-2">연료별 운영중 (개수/용량)</h4>
                <div className="space-y-1.5">
                  {Object.entries(fuelStats).map(([fuel, stats]) => (
                    stats.count > 0 && (
                      <div key={fuel} className="flex justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: categoryColors[fuel] }}
                          />
                          <span className="text-gray-600">{fuel}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-gray-900">{stats.count}개</span>
                          <span className="text-gray-500 ml-1">({stats.capacity.toLocaleString()}MW)</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>

            {/* 뉴스 현황 카드 (모바일에서는 뉴스가 켜졌을 때만 표시) */}
            <div className={`bg-white border border-gray-200 rounded-lg p-4 ${showPowerPlantInfo ? 'hidden lg:block' : ''}`}>
              <h3 className="text-sm font-medium text-gray-900 mb-3">뉴스 현황</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 뉴스</span>
                  <span className="font-bold text-blue-600">{newsStats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">전국 뉴스</span>
                  <span className="font-bold text-green-600">{newsStats.national}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">지역 뉴스</span>
                  <span className="font-bold text-orange-600">{newsStats.regional}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">발전소 뉴스</span>
                  <span className="font-bold text-purple-600">{newsStats.powerPlant}</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 발전소 정보 패널 */}
        {showPowerPlantInfo && (
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">발전소 정보</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {plants.map((plant) => {
                    const category = getPlantCategory(plant.plant_type, plant.fuel_type, plant.name);
                    const color = categoryColors[category] ?? '#6B7280';
                    return (
                      <div key={plant.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-1">
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
                          <div className={`inline-block px-2 py-1 rounded text-xs ${
                            plant.status === '운영중' ? 'bg-green-100 text-green-800' :
                            plant.status === '건설중' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {plant.status}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 뉴스 패널 */}
        {showAllNews && (
          <div className="mt-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">뉴스</h3>
                  <div className="flex gap-2">
                    <select 
                      value={newsFilter.locationType || 'all'}
                      onChange={(e) => setNewsFilter(prev => ({ 
                        ...prev, 
                        locationType: e.target.value === 'all' ? undefined : e.target.value as any 
                      }))}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="all">전체</option>
                      <option value="national">전국</option>
                      <option value="regional">지역</option>
                      <option value="power_plant">발전소</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-4">
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
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
