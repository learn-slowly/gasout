"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { testResults } from "@/data/climateResults";
import { TestResult, ClimateType } from "@/types/climateTest";
import { initKakao, shareToKakao } from "@/lib/kakao";
import { motion } from "framer-motion";

interface Stats {
  totalTests: number;
  totalDeclarations: number;
  sameTypeCount: number;
  sameTypePercentage: number;
}

function ResultCard({ result }: { result: TestResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative mx-auto w-full max-w-[320px]"
    >
      <div
        className={`relative rounded-2xl bg-gradient-to-b ${result.color.gradient} p-[2px] shadow-2xl`}
      >
        <div className="rounded-2xl bg-gradient-to-b from-black/20 to-black/40 backdrop-blur-sm">
          {/* 코너 장식 */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-lg" />

          <div className="px-8 pt-8 pb-10">
            {/* 상단: 기후시민선언 */}
            <div className="text-center mb-2">
              <span className="text-[10px] font-medium tracking-[0.2em] text-white/50 uppercase">
                기후시민선언
              </span>
            </div>

            {/* 축 배지 */}
            <div className="flex justify-center gap-2 mb-8">
              <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                {result.axis1Label}
              </span>
              <span className="text-[11px] font-semibold text-white/70 bg-white/10 px-3 py-1 rounded-full">
                {result.axis2Label}
              </span>
            </div>

            {/* 아이콘 */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-center mb-6"
            >
              <span className="text-6xl">{result.emoji}</span>
            </motion.div>

            {/* 구분선 */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-[1px] bg-white/20" />
              <div className="w-1.5 h-1.5 rotate-45 bg-white/30" />
              <div className="flex-1 h-[1px] bg-white/20" />
            </div>

            {/* 유형 이름 */}
            <h2 className="text-center text-2xl font-black text-white tracking-tight mb-2">
              {result.typeName}
            </h2>

            {/* 짧은 구분선 */}
            <div className="w-8 h-[2px] bg-white/30 mx-auto mb-5" />

            {/* 설명 */}
            <p className="text-center text-[13px] text-white/70 leading-relaxed mb-6">
              {result.description}
            </p>

            {/* 공유 문구 */}
            <div className="text-center">
              <p className="text-[13px] text-white/50 italic">
                &ldquo;{result.shareQuote}&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alreadyDeclared, setAlreadyDeclared] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type") as ClimateType;
    const sessionId = searchParams.get("session");
    const declared = searchParams.get("declared");

    if (declared === "true") {
      setAlreadyDeclared(true);
    }

    if (type && testResults[type]) {
      setResult(testResults[type]);
      setLoading(false);
      fetchStats(type);
    } else if (sessionId) {
      fetchResultBySession(sessionId);
    } else {
      router.push("/test");
    }
  }, [searchParams, router]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    const tryInitialize = () => {
      attempts++;
      const success = initKakao();
      if (!success && attempts < maxAttempts) setTimeout(tryInitialize, 500);
    };
    const timer = setTimeout(tryInitialize, 500);
    return () => clearTimeout(timer);
  }, []);

  const fetchStats = async (type: ClimateType) => {
    try {
      const response = await fetch(`/api/climate-test/stats?type=${type}`);
      if (response.ok) setStats(await response.json());
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchResultBySession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/climate-test/result?session=${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.resultType && testResults[data.resultType as ClimateType]) {
          setResult(testResults[data.resultType as ClimateType]);
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
    const emoji = result?.emoji || "";
    const shareQuote = result?.shareQuote || "";
    const testUrl = `${window.location.origin}/test`;

    switch (platform) {
      case "kakao":
        const success = shareToKakao({
          title: `${emoji} 나의 기후시민 유형: ${typeName}`,
          description: `"${shareQuote}"\n\n4문항 밸런스게임으로 나의 기후시민 유형 알아보기!`,
          linkUrl: testUrl,
          buttonText: '나도 테스트하기',
          imageUrl: `${window.location.origin}/test.jpg`,
        });
        if (!success) {
          navigator.clipboard.writeText(testUrl);
        }
        break;
      case "url":
        navigator.clipboard.writeText(testUrl);
        alert("링크가 복사되었습니다!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `나의 기후시민 유형: ${typeName}`,
            text: `"${shareQuote}" — 나의 기후시민 유형은 ${typeName}!`,
            url: testUrl,
          }).catch(() => {
            navigator.clipboard.writeText(testUrl);
            alert("링크가 복사되었습니다!");
          });
        } else {
          navigator.clipboard.writeText(testUrl);
          alert("링크가 복사되었습니다!");
        }
    }
  };

  const handleDeclare = () => {
    const type = result?.type || "";
    const sessionId = searchParams.get("session");
    const params = new URLSearchParams({ from: "result" });
    if (type) params.set("type", type);
    if (sessionId) params.set("session", sessionId);
    router.push(`/test/declare?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
          <p className="text-sm text-gray-400">결과를 분석 중이에요...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">결과를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push("/test")}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            테스트 다시 하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-5 py-16">
      <div className="max-w-lg mx-auto">

        {/* 결과 카드 */}
        <div className="mb-12">
          <ResultCard result={result} />
        </div>

        {/* CTA: 기후시민 선언 */}
        {alreadyDeclared ? (
          <div className="rounded-xl bg-green-700 p-6 text-center mb-10">
            <h2 className="text-lg font-bold text-white mb-2">
              기후시민이 되신 것을 환영합니다
            </h2>
            <p className="text-sm text-green-200">
              당신의 선언이 기후위기 대응에 큰 힘이 됩니다.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-green-700 p-6 text-center mb-10">
            <h2 className="text-lg font-bold text-white mb-2">
              첫 번째 실천을 시작하세요
            </h2>
            <p className="text-sm text-green-200 mb-5">
              당신이 할 수 있는 첫 번째 실천은 기후시민 선언입니다
            </p>
            <button
              onClick={handleDeclare}
              className="w-full h-12 bg-white hover:bg-green-50 text-green-800 text-[15px] font-semibold rounded-xl transition-colors"
            >
              기후시민 선언하기
            </button>
            {stats?.totalDeclarations ? (
              <p className="text-xs text-green-200 mt-3">
                이미 {stats.totalDeclarations.toLocaleString()}명이 함께하고 있어요
              </p>
            ) : null}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">함께하는 기후시민</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center py-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-black text-gray-900">{stats.totalTests.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">테스트 완료</div>
              </div>
              <div className="text-center py-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-black text-gray-900">{stats.sameTypeCount.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">같은 유형</div>
              </div>
              <div className="text-center py-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-2xl font-black text-gray-900">{stats.totalDeclarations.toLocaleString()}</div>
                <div className="text-xs text-gray-400 mt-1">기후시민 선언</div>
              </div>
            </div>
          </div>
        )}

        {/* Share */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-500 mb-4">친구들에게도 알려주세요</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare("kakao")}
              className="h-11 border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 rounded-xl transition-colors"
            >
              카카오톡 공유
            </button>
            <button
              onClick={() => handleShare("url")}
              className="h-11 border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-gray-700 rounded-xl transition-colors"
            >
              링크 복사
            </button>
          </div>
        </div>

        <button
          onClick={() => router.push("/test")}
          className="w-full text-sm text-gray-400 hover:text-gray-900 transition-colors"
        >
          다시 테스트하기
        </button>
      </div>
    </div>
  );
}

export default function TestResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
          <p className="text-sm text-gray-400">결과를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
