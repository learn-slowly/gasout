"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

type Stats = {
  totalPlants: number;
  totalPosts: number;
  recentPosts: number;
  operatingPlants: number;
  pendingArticles: number;
};

type RecentPost = {
  id: string;
  title: string;
  created_at: string;
  plant_name: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalPlants: 0, totalPosts: 0, recentPosts: 0, operatingPlants: 0, pendingArticles: 0 });
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingGeocode, setUploadingGeocode] = useState(false);
  const [geocodeResult, setGeocodeResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admin/login");
      return;
    }

    // 관리자 권한 확인
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

  const loadData = async () => {
    try {
      // 통계 데이터 로드
      const [plantsResult, postsResult, operatingResult, recentPostsResult, pendingArticlesResult] = await Promise.all([
        supabase.from("power_plants").select("id", { count: "exact" }),
        supabase.from("activity_posts").select("id", { count: "exact" }),
        supabase.from("power_plants").select("id", { count: "exact" }).eq("status", "운영중"),
        supabase.from("activity_posts").select("id", { count: "exact" }).gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from("articles").select("id", { count: "exact" }).eq("status", "pending")
      ]);

      // 최근 게시물 로드
      const { data: recentPostsData } = await supabase
        .from("activity_posts")
        .select(`
          id,
          title,
          created_at,
          power_plants!inner(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalPlants: plantsResult.count || 0,
        totalPosts: postsResult.count || 0,
        recentPosts: recentPostsResult.count || 0,
        operatingPlants: operatingResult.count || 0,
        pendingArticles: pendingArticlesResult.count || 0,
      });

      setRecentPosts(
        recentPostsData?.map(post => ({
          id: post.id,
          title: post.title,
          created_at: post.created_at,
          plant_name: (post.power_plants as any).name
        })) || []
      );
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // 좌표가 없는 항목 geocoding
  const handleGeocodeMissing = async () => {
    setUploadingGeocode(true);
    setGeocodeResult(null);
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
        
        setGeocodeResult({
          success: geocodedCount > 0,
          message,
        });
      } else {
        setGeocodeResult({
          success: false,
          message: result.error || 'Geocoding 실패',
        });
      }
    } catch (error: any) {
      setGeocodeResult({
        success: false,
        message: error.message || 'Geocoding 중 오류 발생',
      });
    } finally {
      setUploadingGeocode(false);
    }
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
        {/* 헤더 - 미니멀하고 조밀한 디자인 */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">관리자 대시보드</h1>
                <p className="text-xs text-gray-500">LNG 발전소 플랫폼 관리</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push("/")}
                className="text-xs"
              >
                메인 페이지
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

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">{stats.totalPlants}</div>
                  <div className="text-sm text-gray-600 font-medium">총 발전소 수</div>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">{stats.operatingPlants}</div>
                  <div className="text-sm text-gray-600 font-medium">운영중</div>
                </div>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${(stats.operatingPlants / stats.totalPlants) * 100}%`}}
                ></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-orange-50 to-orange-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">{stats.totalPosts}</div>
                  <div className="text-sm text-gray-600 font-medium">총 게시물</div>
                </div>
              </div>
              <div className="w-full bg-orange-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '100%'}}></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">{stats.recentPosts}</div>
                  <div className="text-sm text-gray-600 font-medium">최근 7일 게시물</div>
                </div>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                  style={{width: `${(stats.recentPosts / stats.totalPosts) * 100}%`}}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-indigo-50 to-indigo-100/50 relative overflow-hidden">
            {stats.pendingArticles > 0 && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-red-500 text-white font-bold px-3 py-1 text-sm animate-pulse">
                  {stats.pendingArticles}개 대기중
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">기사 검토</CardTitle>
              </div>
              <CardDescription className="text-sm">
                Inoreader로부터 수집된 기사를 검토하고 승인합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/articles">
                <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">
                  {stats.pendingArticles > 0 ? `${stats.pendingArticles}개 기사 검토하기` : '기사 검토하기'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">활동 소식 관리</CardTitle>
              </div>
              <CardDescription className="text-gray-600">발전소 관련 활동 소식을 작성하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Link href="/admin/posts">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    게시물 관리
                  </Button>
                </Link>
                <Link href="/admin/posts/new">
                  <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 게시물 작성
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-green-50 to-green-100/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <CardTitle className="text-xl">발전소 관리</CardTitle>
              </div>
              <CardDescription className="text-gray-600">발전소 정보를 추가하고 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Link href="/admin/plants">
                  <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    발전소 목록
                  </Button>
                </Link>
                <Link href="/admin/plants/new">
                  <Button variant="outline" className="w-full border-green-200 text-green-600 hover:bg-green-50">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 발전소 추가
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">사용자 관리</CardTitle>
              </div>
              <CardDescription className="text-gray-600">관리자 계정과 권한을 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Link href="/admin/users">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    사용자 목록
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-purple-200 text-purple-600 hover:bg-purple-50" disabled>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  권한 관리 (준비중)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-teal-50 to-teal-100/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-500 rounded-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">좌표 업데이트</CardTitle>
              </div>
              <CardDescription className="text-gray-600">좌표가 없는 발전소의 주소를 자동으로 geocoding합니다</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <Button 
                  onClick={handleGeocodeMissing}
                  disabled={uploadingGeocode}
                  className="w-full bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  {uploadingGeocode ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      좌표 자동 추가
                    </>
                  )}
                </Button>
                {geocodeResult && (
                  <div className={`text-sm p-3 rounded-md ${
                    geocodeResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {geocodeResult.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 게시물 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동 소식</CardTitle>
            <CardDescription>최근에 작성된 활동 소식들입니다</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                최근 게시물이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{post.title}</h3>
                      <p className="text-sm text-gray-600">{post.plant_name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </Badge>
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="outline" size="sm">편집</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
