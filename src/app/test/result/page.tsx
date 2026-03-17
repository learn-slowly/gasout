"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { testResults } from "@/data/climateResults";
import { TestResult, MBTIType } from "@/types/climateTest";
import { initKakao, shareToKakao } from "@/lib/kakao";

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
  const [alreadyDeclared, setAlreadyDeclared] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type") as MBTIType;
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

  const fetchStats = async (type: MBTIType) => {
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
    const emoji = result?.emoji || "";
    const quote = result?.quote || "";
    const url = `${window.location.origin}/test/result?type=${type}`;

    switch (platform) {
      case "kakao":
        const success = shareToKakao({
          title: `${emoji} 나의 기후행동 스타일: ${typeName}`,
          description: `"${quote}"\n\n16가지 기후시민 유형 중 나는 어떤 타입?\n3분이면 알 수 있어요!`,
          linkUrl: url,
          buttonText: '나도 테스트하기',
          imageUrl: `${window.location.origin}/test.jpg`,
        });
        if (!success) {
          navigator.clipboard.writeText(url);
        }
        break;
      case "url":
        navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다!");
        break;
      default:
        if (navigator.share) {
          navigator.share({
            title: `나의 기후행동 스타일: ${typeName}`,
            text: `나의 기후행동 스타일은 "${typeName}"이에요!`,
            url: url,
          }).catch(() => {
            navigator.clipboard.writeText(url);
            alert("링크가 복사되었습니다!");
          });
        } else {
          navigator.clipboard.writeText(url);
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

        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">{result.emoji}</div>
          <div className="inline-block text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-3">
            {result.type}
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-4">
            {result.typeName}
          </h1>
          <p className="text-[15px] text-gray-500 italic leading-relaxed">
            &ldquo;{result.quote}&rdquo;
          </p>
        </div>

        <p className="text-[15px] text-gray-600 leading-relaxed mb-10">
          {result.description}
        </p>

        {/* CTA */}
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

        {/* Characteristics */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">당신의 특징</h2>
          <ul className="space-y-3">
            {result.characteristics.map((char, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="text-green-500 mt-0.5 shrink-0">&#8226;</span>
                <span className="text-sm text-gray-600 leading-relaxed">{char}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strengths */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">당신의 강점</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{result.strengths}</p>
        </div>

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

        {/* Recommended actions */}
        <div className="mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">추천 기후행동</h2>
          <div className="space-y-3">
            {result.recommendedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="shrink-0 w-6 h-6 bg-green-700 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Partners */}
        {(result.bestPartner || result.heartPartner || result.synergyPartner) && (
          <div className="mb-10">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">나와 잘 맞는 기후동지</h2>
            <div className="space-y-3">
              {result.bestPartner && (
                <PartnerCard
                  label="최고의 파트너"
                  partner={result.bestPartner}
                />
              )}
              {result.heartPartner && (
                <PartnerCard
                  label="마음이 통하는 파트너"
                  partner={result.heartPartner}
                />
              )}
              {result.synergyPartner && (
                <PartnerCard
                  label="시너지 파트너"
                  partner={result.synergyPartner}
                />
              )}
            </div>
          </div>
        )}

        {/* LNG Facts */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">LNG의 진실</h2>

          <div className="space-y-3 text-sm text-gray-600 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
              기후위기 시대, 에너지 전환은 필수
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
              지역 주민이 배제되지 않는 정의로운 전환이 중요
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
              정부의 LNG 확대는 한계
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3 space-y-2 text-sm text-gray-500">
            <p><span className="font-semibold text-gray-700">화석연료:</span> LNG는 화석연료로 탄소중립 역행</p>
            <p><span className="font-semibold text-gray-700">경제적 손실:</span> 장기적 가동률이 매우 낮아져 세금 부담으로 이어짐</p>
            <p><span className="font-semibold text-gray-700">구조적 불평등:</span> 지역은 피해, 혜택은 외부인 구조 개선 필요</p>
          </div>
        </div>

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

function PartnerCard({ label, partner }: { label: string; partner: { emoji: string; type: string; typeName: string; description: string; together: string; activity: string } }) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{partner.emoji}</span>
        <div>
          <span className="text-xs text-gray-400">{label}</span>
          <h3 className="text-sm font-bold text-gray-900">
            {partner.type} - {partner.typeName}
          </h3>
        </div>
      </div>
      <ul className="space-y-1.5 text-sm text-gray-600">
        <li className="flex items-start gap-2">
          <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
          {partner.description}
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
          함께하면: {partner.together}
        </li>
        <li className="flex items-start gap-2">
          <span className="text-gray-300 mt-0.5 shrink-0">&#8226;</span>
          추천 활동: {partner.activity}
        </li>
      </ul>
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
