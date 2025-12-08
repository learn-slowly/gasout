"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FactDetail {
  id: number;
  emoji: string;
  title: string;
  subtitle: string;
  summary: string;
  details: string[];
  sources?: string[];
  actionText: string;
}

const factDetails: FactDetail[] = [
  {
    id: 1,
    emoji: "🔥",
    title: "LNG도 화석연료입니다",
    subtitle: "LNG(액화천연가스)는 '깨끗한 에너지'가 아닙니다",
    summary: "정부와 기업은 LNG를 '친환경 전환 연료'라고 홍보하지만, 이는 사실이 아닙니다.",
    details: [
      "LNG는 천연가스를 -162°C로 냉각해 액화한 화석연료입니다.",
      "채굴-운송-저장 과정에서 강력한 온실가스인 메탄이 대량 누출됩니다.",
      "메탄은 CO2보다 80배 이상 강력한 온실효과를 일으킵니다.",
      "LNG 발전소는 석탄보다 적지만, 여전히 상당한 양의 CO2를 배출합니다.",
      "'깨끗한 에너지'라는 표현은 화석연료 산업의 그린워싱입니다.",
    ],
    sources: [
      "IPCC 제6차 평가보고서",
      "국제에너지기구(IEA) 메탄 추적 보고서",
    ],
    actionText: "LNG는 석탄의 대안이 아닙니다. 진정한 대안은 재생에너지입니다.",
  },
  {
    id: 2,
    emoji: "💸",
    title: "좌초자산이 될 위험",
    subtitle: "수조 원의 세금이 낭비될 수 있습니다",
    summary: "LNG 발전소는 건설 후 제대로 가동되지 못하고 '좌초자산'이 될 가능성이 높습니다.",
    details: [
      "LNG 발전소의 설계 수명은 30~40년입니다.",
      "그러나 2050 탄소중립 목표로 인해 10~15년 내에 가동 중단될 가능성이 높습니다.",
      "재생에너지 비용이 급격히 하락하면서 LNG 발전의 경쟁력이 사라지고 있습니다.",
      "가동률이 낮아지면 투자 손실이 전기요금과 세금 부담으로 전가됩니다.",
      "이미 해외에서는 LNG 발전소 건설 계획이 대거 취소되고 있습니다.",
    ],
    sources: [
      "Carbon Tracker Initiative 보고서",
      "한국환경연구원 연구",
    ],
    actionText: "미래 세대에게 빚을 떠넘기지 맙시다. 지금 재생에너지로 전환해야 합니다.",
  },
  {
    id: 3,
    emoji: "⚡",
    title: "재생에너지가 더 저렴합니다",
    subtitle: "경제적으로도 재생에너지가 합리적인 선택입니다",
    summary: "태양광, 풍력 등 재생에너지 발전 비용이 화석연료보다 저렴해졌습니다.",
    details: [
      "2023년 기준 태양광 발전 비용은 kWh당 30~40원대입니다.",
      "LNG 발전 비용은 kWh당 50원대 이상입니다.",
      "재생에너지 비용은 지속적으로 하락하고 있습니다.",
      "전 세계 신규 발전 설비의 80% 이상이 재생에너지입니다.",
      "에너지 전환은 환경뿐 아니라 경제적으로도 합리적인 선택입니다.",
    ],
    sources: [
      "국제재생에너지기구(IRENA) 비용 분석",
      "블룸버그 NEF 에너지 전망",
    ],
    actionText: "재생에너지는 더 이상 비싼 에너지가 아닙니다. 가장 경제적인 선택입니다.",
  },
  {
    id: 4,
    emoji: "🌍",
    title: "탄소중립과 LNG의 모순",
    subtitle: "수학이 안 맞습니다",
    summary: "전 세계가 2050 탄소중립을 선언했지만, LNG 발전소는 이 목표와 정면으로 충돌합니다.",
    details: [
      "한국은 2050년까지 탄소중립을 달성하겠다고 선언했습니다.",
      "그러나 LNG 발전소는 30~40년 동안 가동되어야 투자비를 회수할 수 있습니다.",
      "2025년에 건설을 시작하면 2055~2065년까지 가동해야 합니다.",
      "이는 탄소중립 목표와 정면으로 충돌합니다.",
      "EU는 2035년부터 신규 화석연료 발전소를 금지합니다.",
      "미국과 중국도 재생에너지 투자를 급격히 늘리고 있습니다.",
    ],
    sources: [
      "대한민국 2050 탄소중립 시나리오",
      "EU Green Deal",
    ],
    actionText: "한국만 거꾸로 가고 있습니다. 지금 방향을 바꿔야 합니다.",
  },
];

function LearnMoreContent() {
  const searchParams = useSearchParams();
  const factId = searchParams.get("fact");
  const [expandedFact, setExpandedFact] = useState<number | null>(
    factId ? parseInt(factId) : null
  );

  const toggleFact = (id: number) => {
    setExpandedFact(expandedFact === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 py-8 px-4 pb-safe">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            💡 LNG의 진실
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            정부가 말하지 않는 LNG 발전소의 문제점
          </p>
        </div>

        {/* 팩트 카드들 */}
        {factDetails.map((fact) => (
          <Card
            key={fact.id}
            className={`border-0 shadow-xl overflow-hidden transition-all duration-300 ${
              expandedFact === fact.id ? "ring-2 ring-green-500" : ""
            }`}
          >
            <CardContent className="p-0">
              {/* 헤더 (클릭 가능) */}
              <button
                onClick={() => toggleFact(fact.id)}
                className="w-full p-5 sm:p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">{fact.emoji}</span>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                      {fact.title}
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">
                      {fact.subtitle}
                    </p>
                  </div>
                  <span className="text-2xl text-gray-400">
                    {expandedFact === fact.id ? "−" : "+"}
                  </span>
                </div>
              </button>

              {/* 상세 내용 */}
              {expandedFact === fact.id && (
                <div className="px-5 sm:px-6 pb-6 border-t border-gray-100">
                  {/* 요약 */}
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mt-4 rounded-r-lg">
                    <p className="text-gray-800 font-medium">{fact.summary}</p>
                  </div>

                  {/* 상세 포인트 */}
                  <ul className="mt-5 space-y-3">
                    {fact.details.map((detail, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 text-sm sm:text-base leading-relaxed">
                          {detail}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* 출처 */}
                  {fact.sources && (
                    <div className="mt-5 pt-4 border-t border-gray-100">
                      <p className="text-xs sm:text-sm text-gray-500">
                        <strong>출처:</strong> {fact.sources.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* 행동 유도 */}
                  <div className="mt-5 bg-green-50 rounded-xl p-4">
                    <p className="text-green-800 font-semibold text-sm sm:text-base">
                      👉 {fact.actionText}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* 하단 CTA */}
        <Card className="border-0 shadow-xl bg-gradient-to-r from-green-500 to-emerald-600">
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              함께 행동해요
            </h2>
            <p className="text-green-50 mb-6 text-base sm:text-lg">
              기후시민 선언에 참여하고<br />
              LNG 발전소 건설을 막아주세요
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/declaration">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white hover:bg-gray-50 text-green-600 font-bold px-8"
                >
                  기후시민 선언하기
                </Button>
              </Link>
              <Link href="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 font-bold px-8"
                >
                  홈으로 돌아가기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 추가 자료 링크 */}
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            더 자세한 정보가 필요하신가요?
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <a
              href="https://www.ipcc.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-sm font-medium underline"
            >
              IPCC 보고서 →
            </a>
            <a
              href="https://www.iea.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-sm font-medium underline"
            >
              국제에너지기구(IEA) →
            </a>
            <a
              href="https://www.irena.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-sm font-medium underline"
            >
              국제재생에너지기구(IRENA) →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LearnMorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LearnMoreContent />
    </Suspense>
  );
}
