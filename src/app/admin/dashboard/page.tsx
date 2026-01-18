"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
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
      setUploadingGeocode(false);
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedCount, setAnalyzedCount] = useState(0);
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);

  const handleBulkAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalyzedCount(0);
    setAnalyzeResult(null);

    let totalProcessed = 0;
    let hasError = false;

    try {
      // 재귀적으로 호출하여 모든 기사 처리
      const processBatch = async (): Promise<void> => {
        if (hasError) return;

        const response = await fetch('/api/admin/analyze-news', { method: 'POST' });
        const result = await response.json();

        if (!response.ok) {
          hasError = true;
          throw new Error(result.details || result.error || "알 수 없는 서버 에러");
        }

        if (result.processed > 0) {
          totalProcessed += result.processed;
          setAnalyzedCount(totalProcessed);
          // 계속해서 다음 배치 처리
          // Gemini Free Tier Limit (~15 RPM) 준수를 위해 4초 이상 대기
          await new Promise(r => setTimeout(r, 4000));
          return processBatch();
        } else if (result.failed && result.failed > 0) {
          const firstError = result.errors?.[0];
          throw new Error(`AI 분석 실패 (${result.failed}건): ${firstError?.error || '상세 에러 없음'}`);
        } else {
          // 더 이상 처리할 기사가 없음
          return;
        }
      };

      await processBatch();

      if (!hasError) {
        if (totalProcessed === 0) {
          // If the API returned a debug/info message, try to show it
          const firstResponse = await fetch('/api/admin/analyze-news', { method: 'POST' });
          const firstResult = await firstResponse.json();

          if (firstResult.debug_info) {
            setAnalyzeResult(`진단 결과: ${JSON.stringify(firstResult.debug_info, null, 2)}`);
          } else {
            setAnalyzeResult("분석할 새로운 기사가 없습니다. (DB 확인 필요)");
          }
        } else {
          setAnalyzeResult(`${totalProcessed}개 기사 분석 완료`);
        }
      }
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setAnalyzeResult(`오류: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 pt-20 px-4">
        {/* 헤더 */}
        <div className="bg-transparent mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/10">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight text-glow">관리자 대시보드</h1>
              <p className="text-sm text-slate-400 mt-1">LNG 발전소 플랫폼 통합 관리</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm"
            >
              메인 페이지
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all backdrop-blur-sm"
            >
              로그아웃
            </Button>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="glass-card hover:border-blue-500/30 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{stats.totalPlants}</div>
                  <div className="text-sm text-slate-400 font-medium">총 발전소 수</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-green-500/30 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">{stats.operatingPlants}</div>
                  <div className="text-sm text-slate-400 font-medium">운영중</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  style={{ width: `${(stats.operatingPlants / stats.totalPlants) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-orange-500/30 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-orange-400 transition-colors">{stats.totalPosts}</div>
                  <div className="text-sm text-slate-400 font-medium">총 게시물</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" style={{ width: '100%' }}></div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:border-purple-500/30 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">{stats.recentPosts}</div>
                  <div className="text-sm text-slate-400 font-medium">최근 7일 게시물</div>
                </div>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  style={{ width: `${(stats.recentPosts / stats.totalPosts) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 메뉴 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card hover:bg-slate-800/80 group">
            {stats.pendingArticles > 0 && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-red-500 text-white font-bold px-3 py-1 text-sm animate-pulse border-0 shadow-lg shadow-red-500/40">
                  {stats.pendingArticles}개 대기중
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-white">기사 검토</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Inoreader로부터 수집된 기사를 검토하고 승인합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Link href="/admin/articles">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 shadow-md shadow-indigo-900/20 transition-all mb-3">
                  {stats.pendingArticles > 0 ? `${stats.pendingArticles}개 기사 검토하기` : '기사 검토하기'}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Link>
              <div className="pt-2 border-t border-white/5">
                <Button
                  variant="outline"
                  onClick={handleBulkAnalysis}
                  disabled={isAnalyzing}
                  className="w-full bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 hover:text-indigo-200"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {analyzedCount}개 분석 중...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🤖</span> AI 일괄 분석 실행
                    </>
                  )}
                </Button>
                {analyzeResult && (
                  <div className={`mt-2 text-xs text-center ${analyzeResult.includes("완료") ? "text-green-400" : "text-amber-400"}`}>
                    {analyzeResult}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:bg-slate-800/80 group">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-white">활동 소식 관리</CardTitle>
              </div>
              <CardDescription className="text-slate-400">발전소 관련 활동 소식을 작성하고 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Link href="/admin/posts">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white h-11 font-medium transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    게시물 관리
                  </Button>
                </Link>
                <Link href="/admin/posts/new">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white h-11 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 게시물 작성
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:bg-slate-800/80 group">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-white">발전소 관리</CardTitle>
              </div>
              <CardDescription className="text-slate-400">발전소 정보를 추가하고 수정하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Link href="/admin/plants">
                  <Button className="w-full bg-green-600 hover:bg-green-500 text-white h-11 font-medium transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    발전소 목록
                  </Button>
                </Link>
                <Link href="/admin/plants/new">
                  <Button variant="outline" className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white h-11 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    새 발전소 추가
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:bg-slate-800/80 group">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-white">사용자 관리</CardTitle>
              </div>
              <CardDescription className="text-slate-400">관리자 계정과 권한을 관리하세요</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Link href="/admin/users">
                  <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white h-11 font-medium transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    사용자 목록
                  </Button>
                </Link>
                <Button variant="outline" className="w-full bg-white/5 border-white/10 text-slate-500 h-11 cursor-not-allowed" disabled>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  권한 관리 (준비중)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card hover:bg-slate-800/80 group">
            <CardHeader className="pb-4 border-b border-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-teal-500/20 rounded-lg">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <CardTitle className="text-xl text-white">좌표 업데이트</CardTitle>
              </div>
              <CardDescription className="text-slate-400">좌표가 없는 발전소의 주소를 자동으로 geocoding합니다</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button
                  onClick={handleGeocodeMissing}
                  disabled={uploadingGeocode}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white h-11 font-medium transition-colors"
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
                  <div className={`text-sm p-3 rounded-md ${geocodeResult.success ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                    {geocodeResult.message}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 최근 게시물 */}
        <Card className="glass-card">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-white">최근 활동 소식</CardTitle>
            <CardDescription className="text-slate-400">최근에 작성된 활동 소식들입니다</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border border-dashed border-white/10 rounded-xl">
                최근 게시물이 없습니다.
              </div>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border border-white/5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    <div>
                      <h3 className="font-bold text-slate-200 mb-1">{post.title}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        {post.plant_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-white/10 text-slate-400">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </Badge>
                      <Link href={`/admin/posts/${post.id}`}>
                        <Button variant="outline" size="sm" className="bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20">
                          편집
                        </Button>
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
