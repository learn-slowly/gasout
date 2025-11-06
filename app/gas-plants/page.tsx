"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase } from "@/src/lib/supabase";
import type { GasPlant } from "@/src/types/gasPlant";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

const GasPlantMap = dynamic(() => import("@/src/components/gas/GasPlantMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] flex items-center justify-center text-sm text-gray-500">
      지도를 불러오는 중...
    </div>
  ),
});

export default function GasPlantsPage() {
  const [plants, setPlants] = useState<GasPlant[]>([]);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<'복합발전' | '열병합발전' | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'운영' | '건설' | '계획' | 'all'>('all');
  const [selectedPlant, setSelectedPlant] = useState<GasPlant | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [uploadingTerminals, setUploadingTerminals] = useState(false);
  const [uploadTerminalsResult, setUploadTerminalsResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    async function loadPlants() {
      try {
        // Supabase 연결 확인
        if (!supabase) {
          const errorMsg = 'Supabase client is not initialized. Please check your environment variables.';
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }

        // 환경 변수 확인
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          const errorMsg = 'Supabase environment variables are not set. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.';
          console.error(errorMsg);
          setError(errorMsg);
          setLoading(false);
          return;
        }

        console.log('Attempting to load gas plants from Supabase...');
        
        const { data, error } = await supabase
          .from('gas_plants')
          .select('*')
          .order('plant_name');

        if (error) {
          // 에러 객체의 속성들을 안전하게 추출
          const errorMessage = error.message || String(error) || '데이터를 불러오는데 실패했습니다.';
          const errorDetails = error.details || '';
          const errorHint = error.hint || '';
          const errorCode = error.code || '';
          
          // 상세 에러 정보 로깅
          console.error('Supabase Error:', {
            message: errorMessage,
            details: errorDetails,
            hint: errorHint,
            code: errorCode,
          });
          
          // 에러 객체의 모든 속성 확인
          console.error('Full error object:', error);
          console.error('Error type:', typeof error);
          console.error('Error constructor:', error?.constructor?.name);
          
          // 에러 메시지 구성
          let fullErrorMsg = errorMessage;
          if (errorDetails) {
            fullErrorMsg += `\n상세: ${errorDetails}`;
          }
          if (errorHint) {
            fullErrorMsg += `\n힌트: ${errorHint}`;
          }
          if (errorCode) {
            fullErrorMsg += `\n코드: ${errorCode}`;
          }
          
          setError(fullErrorMsg);
          setPlants([]);
          setLoading(false);
          return;
        }

        const loadedCount = data?.length || 0;
        console.log(`Successfully loaded ${loadedCount} gas plants`);
        
        if (loadedCount === 0) {
          console.warn('No gas plants found in database. You may need to upload data.');
          // 에러는 설정하지 않고, UI에서 업로드 카드를 표시
          setError(null);
        } else {
          // 좌표가 있는 데이터 개수 확인
          const withCoords = data?.filter(p => p.latitude && p.longitude).length || 0;
          console.log(`${withCoords} plants have coordinates`);
          
          if (withCoords === 0) {
            setError('좌표 정보가 있는 발전소가 없습니다. 데이터에 위도/경도 정보가 포함되어 있는지 확인해주세요.');
          } else {
            setError(null);
          }
        }
        
        setPlants((data || []) as GasPlant[]);
        
        // 터미널 데이터 확인 (업로드 카드 표시용)
        try {
          const { count } = await supabase
            .from('gas_terminals')
            .select('*', { count: 'exact', head: true });
          
          // 터미널이 없으면 빈 배열로 설정 (카드 표시용)
          setTerminals(count && count > 0 ? [{ count }] : []);
        } catch (err) {
          // 터미널 테이블이 없을 수 있음
          setTerminals([]);
        }
      } catch (error: any) {
        // 예상치 못한 에러 처리
        let errorMessage = '알 수 없는 오류가 발생했습니다.';
        
        if (error) {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.toString) {
            errorMessage = error.toString();
          }
        }
        
        console.error('Unexpected error loading gas plants:', {
          error: error,
          message: error?.message,
          stack: error?.stack,
          name: error?.name,
          type: typeof error,
        });
        
        setError(errorMessage);
        setPlants([]);
      } finally {
        setLoading(false);
      }
    }

    loadPlants();
  }, []);

  // 발전소 데이터 업로드 함수
  const handleUpload = async () => {
    setUploading(true);
    setUploadResult(null);
    
    try {
      const response = await fetch('/api/gas-plants/upload', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadResult({
          success: true,
          message: `업로드 완료: ${result.summary.success}개 성공, ${result.summary.failed}개 실패`
        });
        // 데이터 다시 로드
        window.location.reload();
      } else {
        setUploadResult({
          success: false,
          message: result.error || '업로드 실패'
        });
      }
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error?.message || '업로드 중 오류 발생'
      });
    } finally {
      setUploading(false);
    }
  };

  // 터미널 데이터 업로드 함수
  const handleTerminalsUpload = async () => {
    setUploadingTerminals(true);
    setUploadTerminalsResult(null);
    
    try {
      const response = await fetch('/api/gas-terminals/upload', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setUploadTerminalsResult({
          success: true,
          message: `업로드 완료: ${result.summary.success}개 성공, ${result.summary.failed}개 실패`
        });
        // 데이터 다시 로드
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setUploadTerminalsResult({
          success: false,
          message: result.error || '업로드 실패'
        });
      }
    } catch (error: any) {
      setUploadTerminalsResult({
        success: false,
        message: error?.message || '업로드 중 오류 발생'
      });
    } finally {
      setUploadingTerminals(false);
    }
  };

  // 필터링된 발전소
  const filteredPlants = plants.filter(plant => {
    const typeMatch = typeFilter === 'all' || plant.type === typeFilter;
    const statusMatch = statusFilter === 'all' || plant.status === statusFilter;
    return typeMatch && statusMatch;
  });

  // 통계 계산
  const stats = {
    total: plants.length,
    complex: plants.filter(p => p.type === '복합발전').length,
    cogen: plants.filter(p => p.type === '열병합발전').length,
    totalCapacity: plants.reduce((sum, p) => sum + (p.capacity_mw || 0), 0),
    operating: plants.filter(p => p.status === '운영').length,
    construction: plants.filter(p => p.status === '건설').length,
    planned: plants.filter(p => p.status === '계획').length,
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">LNG 가스발전소 지도</h1>
                <p className="text-sm text-gray-600">국내 LNG 가스발전소 현황</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  메인으로
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="p-4 max-w-7xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">⚠️ 오류 발생</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 mb-4">{error}</p>
              <div className="text-sm text-gray-600 space-y-2">
                <p>가능한 원인:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Supabase 테이블이 생성되지 않았을 수 있습니다</li>
                  <li>환경 변수(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)가 설정되지 않았을 수 있습니다</li>
                  <li>Row Level Security(RLS) 정책 문제일 수 있습니다</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="font-semibold mb-2">해결 방법:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Supabase SQL Editor에서 <code className="bg-gray-100 px-1 rounded">web/supabase/gas_plants_schema.sql</code> 실행</li>
                    <li>환경 변수가 올바르게 설정되어 있는지 확인</li>
                    <li>브라우저 콘솔에서 상세한 에러 메시지 확인</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
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
              <h1 className="text-xl font-bold text-gray-900">LNG 가스발전소 지도</h1>
              <p className="text-sm text-gray-600">국내 LNG 가스발전소 현황</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline" size="sm">
                메인으로
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="sm">
                GasOut이란?
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
                  <CardTitle className="text-base">발전소 위치</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span>복합발전</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span>열병합발전</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <div className="h-full w-full">
                  <GasPlantMap
                    typeFilter={typeFilter}
                    statusFilter={statusFilter}
                    onPlantClick={setSelectedPlant}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-4">
            {/* 데이터 업로드 카드 (데이터가 없을 때) */}
            {plants.length === 0 && !loading && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-900">데이터 업로드 필요</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-blue-800">
                    데이터베이스에 LNG 가스발전소 데이터가 없습니다. 데이터를 업로드해주세요.
                  </p>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                    size="sm"
                  >
                    {uploading ? '업로드 중...' : '데이터 업로드'}
                  </Button>
                  {uploadResult && (
                    <div className={`text-xs p-2 rounded ${
                      uploadResult.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {uploadResult.message}
                    </div>
                  )}
                  <div className="text-xs text-gray-600 pt-2 border-t">
                    <p className="font-semibold mb-1">참고:</p>
                    <ul className="list-disc list-inside space-y-1 text-[10px]">
                      <li>데이터 파일: <code className="bg-gray-100 px-1 rounded">data/gas_plants_with_coords.json</code></li>
                      <li>또는 API 엔드포인트: <code className="bg-gray-100 px-1 rounded">POST /api/gas-plants/upload</code></li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 터미널 데이터 업로드 카드 */}
            {terminals.length === 0 && !loading && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-sm text-orange-900">터미널 데이터 업로드</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-orange-800">
                    LNG 터미널 데이터를 업로드하여 통합 지도에서 확인할 수 있습니다.
                  </p>
                  <Button
                    onClick={handleTerminalsUpload}
                    disabled={uploadingTerminals}
                    className="w-full"
                    size="sm"
                    variant="outline"
                  >
                    {uploadingTerminals ? '업로드 중...' : '터미널 데이터 업로드'}
                  </Button>
                  {uploadTerminalsResult && (
                    <div className={`text-xs p-2 rounded ${
                      uploadTerminalsResult.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {uploadTerminalsResult.message}
                    </div>
                  )}
                  <div className="text-xs text-gray-600">
                    <Link href="/gas-facilities" className="text-blue-600 hover:underline">
                      통합 지도 보기 →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 통계 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">가스발전소 현황</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">전체</span>
                  <span className="font-bold text-gray-900">{stats.total}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">복합발전</span>
                  <span className="font-bold text-blue-600">{stats.complex}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">열병합발전</span>
                  <span className="font-bold text-green-600">{stats.cogen}개</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">총 용량</span>
                  <span className="font-bold text-gray-900">{stats.totalCapacity.toLocaleString()} MW</span>
                </div>
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">운영 중</span>
                    <span className="font-bold text-green-600">{stats.operating}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">건설 중</span>
                    <span className="font-bold text-orange-600">{stats.construction}개</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">계획 중</span>
                    <span className="font-bold text-purple-600">{stats.planned}개</span>
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
                  <label className="text-xs text-gray-600 mb-2 block">발전소 유형</label>
                  <Select
                    value={typeFilter}
                    onValueChange={(value) => setTypeFilter(value as any)}
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

        {/* 발전소 목록 */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">발전소 목록 ({filteredPlants.length}개)</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredPlants.map((plant) => {
                  const color = plant.type === '복합발전' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
                  return (
                    <div
                      key={plant.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedPlant(plant)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900">{plant.plant_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded ${color}`}>
                          {plant.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>소유주: {plant.owner}</div>
                        <div>용량: {plant.capacity_mw.toLocaleString()} MW</div>
                        {plant.status && (
                          <div className={`inline-block px-2 py-1 rounded text-xs mt-1 ${
                            plant.status === '운영' ? 'bg-green-100 text-green-800' :
                            plant.status === '건설' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {plant.status}
                          </div>
                        )}
                        {plant.location && (
                          <div className="text-gray-500 mt-1">📍 {plant.location}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

