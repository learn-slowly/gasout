"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { testResults } from "@/src/data/climateResults";
import { TestResult, MBTIType } from "@/src/types/climateTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { initKakao, shareToKakao } from "@/src/lib/kakao";

interface Stats {
  totalTests: number;
  totalDeclarations: number;
  sameTypeCount: number;
  sameTypePercentage: number;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const type = searchParams.get("type") as MBTIType;
    const sessionId = searchParams.get("session");

    if (type && testResults[type]) {
      setResult(testResults[type]);
      setLoading(false);
      // 통계 조회
      fetchStats(type);
    } else if (sessionId) {
      // 세션 ID로 결과 조회
      fetchResultBySession(sessionId);
    } else {
      // 결과가 없으면 테스트 시작 페이지로
      router.push("/declaration");
    }
  }, [searchParams, router]);

  // 카카오 SDK 초기화
  useEffect(() => {
    console.log('[Result Page] Attempting to initialize Kakao SDK...');
    
    // SDK 로드를 위해 여러 번 시도
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryInitialize = () => {
      attempts++;
      console.log(`[Result Page] Initialization attempt ${attempts}/${maxAttempts}`);
      
      const success = initKakao();
      
      if (!success && attempts < maxAttempts) {
        setTimeout(tryInitialize, 500);
      } else if (success) {
        console.log('[Result Page] Kakao SDK initialized successfully');
      } else {
        console.error('[Result Page] Failed to initialize Kakao SDK after', maxAttempts, 'attempts');
      }
    };
    
    // 초기 지연 후 시작
    const timer = setTimeout(tryInitialize, 500);

    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async (type: MBTIType) => {
    try {
      const response = await fetch(`/api/climate-test/stats?type=${type}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchResultBySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/climate-test/result?session=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.resultType && testResults[data.resultType]) {
          setResult(testResults[data.resultType]);
        }
      }
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (platform: string) => {
    const type = result?.type || "";
    const typeName = result?.typeName || "";
    const emoji = result?.emoji || "🌍";
    const quote = result?.quote || "";
    const url = `${window.location.origin}/climate-test/result?type=${type}`;
    const text = `나의 기후행동 스타일은 "${typeName}"이에요!`;

    switch (platform) {
      case "kakao":
        // 카카오톡 공유
        const success = shareToKakao({
          title: `${emoji} ${typeName}`,
          description: `${quote}\n\n나도 기후시민 MBTI 테스트 해보기!`,
          linkUrl: url,
          buttonText: '나도 테스트하기',
          imageUrl: `${window.location.origin}/climate-mbti-og.png`,
        });
        
        // 공유 실패 시 링크 복사로 폴백
        if (!success) {
          navigator.clipboard.writeText(url);
        }
        break;
        
      case "url":
        navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다!");
        break;
        
      default:
        // 다른 플랫폼은 기본 공유 다이얼로그
        if (navigator.share) {
          navigator.share({
            title: `나의 기후행동 스타일: ${typeName}`,
            text: text,
            url: url,
          }).catch(() => {
            // 공유 취소 시 링크 복사로 대체
            navigator.clipboard.writeText(url);
            alert("링크가 복사되었습니다!");
          });
        } else {
          // 공유 API가 없으면 링크 복사
          navigator.clipboard.writeText(url);
          alert("링크가 복사되었습니다!");
        }
    }
  };

  const handleDeclare = () => {
    const type = result?.type || "";
    const sessionId = searchParams.get("session");
    
    // session ID가 있으면 함께 전달
    if (sessionId) {
      router.push(`/climate-test/declare?type=${type}&session=${sessionId}`);
    } else {
      router.push(`/climate-test/declare?type=${type}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4 pb-safe">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">결과를 분석 중이에요...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4 pb-safe">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-6 sm:p-8 text-center">
            <p className="text-gray-600 mb-4 text-sm sm:text-base">결과를 찾을 수 없습니다.</p>
            <Button 
              onClick={() => router.push("/declaration")}
              className="min-h-[44px] touch-manipulation"
            >
              테스트 다시 하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-6 sm:py-8 px-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
        {/* 결과 헤더 */}
        <Card className="border-0 shadow-2xl w-full max-w-full overflow-hidden bg-gradient-to-br from-white to-green-50">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
            {/* 이모지와 MBTI 타입 */}
            <div className="text-7xl sm:text-8xl mb-4">{result.emoji}</div>
            <Badge className="mb-3 sm:mb-4 bg-green-600 text-white text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 font-bold">
              {result.type}
            </Badge>
            
            {/* 캐릭터명 */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight px-2 break-words overflow-wrap-anywhere w-full max-w-full">
              {result.typeName}
            </h1>
            
            {/* 인용구 */}
            <div className="bg-green-100 border-l-4 border-green-600 p-4 sm:p-6 rounded-r-lg mb-4">
              <p className="text-lg sm:text-xl text-green-900 font-medium italic leading-relaxed break-words overflow-wrap-anywhere">
                &ldquo;{result.quote}&rdquo;
              </p>
            </div>
            
            {/* 설명 */}
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
              {result.description}
            </p>
          </CardContent>
        </Card>

        {/* 특징 */}
        <Card className="border-0 shadow-xl w-full max-w-full overflow-hidden">
          <CardContent className="p-5 sm:p-6 md:p-8 w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words overflow-wrap-anywhere">당신의 특징</h2>
            <ul className="space-y-2.5 sm:space-y-3 w-full max-w-full">
              {result.characteristics.map((char, index) => (
                <li key={index} className="flex items-start gap-3 w-full max-w-full min-w-0">
                  <span className="text-green-600 mt-1 flex-shrink-0 text-lg">✓</span>
                  <span className="text-gray-700 text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere flex-1 min-w-0">{char}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 강점 */}
        <Card className="border-0 shadow-xl bg-green-50 w-full max-w-full overflow-hidden">
          <CardContent className="p-5 sm:p-6 md:p-8 w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words overflow-wrap-anywhere">당신의 강점</h2>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full">{result.strengths}</p>
          </CardContent>
        </Card>

        {/* 통계 */}
        {stats && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 w-full max-w-full overflow-hidden">
            <CardContent className="p-5 sm:p-6 md:p-8 w-full max-w-full overflow-hidden">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 break-words overflow-wrap-anywhere flex items-center gap-2">
                <span>📊</span>
                <span>함께하는 기후시민</span>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                {/* 전체 테스트 완료자 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 text-center border border-blue-100">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">
                    {stats.totalTests.toLocaleString()}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">
                    테스트 완료
                  </div>
                </div>

                {/* 같은 유형 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 text-center border border-purple-100">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">
                    {stats.sameTypeCount.toLocaleString()}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">
                    나와 같은 유형
                    {stats.sameTypePercentage > 0 && (
                      <span className="block text-xs text-purple-500 mt-1">
                        ({stats.sameTypePercentage}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* 기후시민 선언 */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-5 text-center border border-green-100">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">
                    {stats.totalDeclarations.toLocaleString()}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600 font-medium">
                    기후시민 선언
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-500 text-center mt-4 sm:mt-6">
                지금까지 <strong className="text-green-600">{stats.totalTests.toLocaleString()}명</strong>이 
                테스트를 완료했고, <strong className="text-green-600">{stats.totalDeclarations.toLocaleString()}명</strong>이 
                기후시민으로 선언했어요! 🌱
              </p>
            </CardContent>
          </Card>
        )}

        {/* 추천 기후행동 */}
        <Card className="border-0 shadow-xl w-full max-w-full overflow-hidden">
          <CardContent className="p-5 sm:p-6 md:p-8 w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words overflow-wrap-anywhere">
              추천 기후행동
            </h2>
            <div className="space-y-3 sm:space-y-4 w-full max-w-full">
              {result.recommendedActions.map((action, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-xl border border-gray-200 w-full max-w-full min-w-0 overflow-hidden"
                >
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm sm:text-base">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 flex-1 text-sm sm:text-base leading-relaxed break-words overflow-wrap-anywhere min-w-0">{action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LNG 팩트 요약 */}
        <Card className="border-0 shadow-xl bg-blue-50 w-full max-w-full overflow-hidden">
          <CardContent className="p-5 sm:p-6 md:p-8 w-full max-w-full overflow-hidden">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 break-words overflow-wrap-anywhere">
              💡 LNG의 진실
            </h2>
            <div className="space-y-2.5 sm:space-y-3 text-gray-700 text-sm sm:text-base leading-relaxed w-full max-w-full">
              <p className="break-words overflow-wrap-anywhere">
                <strong>LNG도 화석연료입니다.</strong> 채굴-운송 과정에서 메탄이
                누출되며, CO2보다 80배 이상 강력한 온실효과를 냅니다.
              </p>
              <p className="break-words overflow-wrap-anywhere">
                <strong>재생에너지가 더 저렴합니다.</strong> 태양광 발전 단가는 LNG
                발전보다 저렴하며, 전 세계가 재생에너지로 전환하고 있습니다.
              </p>
              <p className="break-words overflow-wrap-anywhere">
                <strong>좌초자산이 될 위험</strong>이 있습니다. 2050 탄소중립 목표로
                인해 10~15년 내에 사용하지 못하게 될 가능성이 높습니다.
              </p>
            </div>
            <a
              href="/learn-more"
              className="text-blue-600 hover:text-blue-800 active:text-blue-900 text-sm sm:text-base mt-4 inline-block touch-manipulation"
            >
              자세히 보기 →
            </a>
          </CardContent>
        </Card>

        {/* 기후시민 선언 CTA */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600 w-full max-w-full overflow-hidden">
          <CardContent className="p-6 sm:p-8 md:p-10 text-center w-full max-w-full overflow-hidden">
            <div className="text-4xl sm:text-5xl mb-4">🌱</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4 break-words overflow-wrap-anywhere">
              첫 번째 실천을 시작하세요
            </h2>
            <p className="text-base sm:text-lg text-green-50 mb-6 sm:mb-8 leading-relaxed break-words overflow-wrap-anywhere">
              당신이 할 수 있는 첫 번째 실천은<br />
              <strong className="text-white text-xl sm:text-2xl">기후시민 선언</strong>입니다
            </p>
            <Button
              onClick={handleDeclare}
              size="lg"
              className="w-full bg-white hover:bg-gray-50 active:bg-gray-100 text-green-600 text-base sm:text-lg font-bold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] whitespace-normal"
            >
              지금 바로 기후시민 선언하기 →
            </Button>
            <p className="text-xs sm:text-sm text-green-100 mt-4">
              {stats?.totalDeclarations ? (
                <>이미 <strong className="text-white">{stats.totalDeclarations.toLocaleString()}명</strong>이 함께하고 있어요!</>
              ) : (
                <>지금 바로 기후시민이 되어주세요!</>
              )}
            </p>
          </CardContent>
        </Card>

        {/* 공유 버튼 */}
        <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
          <div className="text-center">
            <p className="text-sm sm:text-base text-gray-600 mb-3">
              친구들에게도 알려주세요!
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
            <Button
              onClick={() => handleShare("kakao")}
              variant="outline"
              className="border-2 min-h-[48px] touch-manipulation text-sm sm:text-base whitespace-normal"
            >
              카카오톡 공유
            </Button>
            <Button
              onClick={() => handleShare("url")}
              variant="outline"
              className="border-2 min-h-[48px] touch-manipulation text-sm sm:text-base whitespace-normal"
            >
              링크 복사
            </Button>
          </div>

          <Button
            onClick={() => router.push("/declaration")}
            variant="ghost"
            className="w-full min-h-[44px] touch-manipulation whitespace-normal text-gray-500"
          >
            다시 테스트하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ClimateTestResult() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600"></div>
          <p className="text-sm font-medium">결과를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}

