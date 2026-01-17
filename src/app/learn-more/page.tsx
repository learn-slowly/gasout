"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { factDetails } from "@/data/factDetails";

function LearnMoreContent() {
  const searchParams = useSearchParams();
  const [activeFactId, setActiveFactId] = useState<number>(1);

  useEffect(() => {
    const factId = searchParams.get("fact");
    if (factId) {
      setActiveFactId(parseInt(factId));

      // 해당 섹션으로 스크롤
      setTimeout(() => {
        const element = document.getElementById(`fact-${factId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-20 sm:pt-24 p-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-3xl overflow-hidden space-y-6 sm:space-y-8">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            📚 기후위기, 더 깊이 알아보기
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            우리가 꼭 알아야 할 불편한 진실들
          </p>
        </div>

        {/* 팩트 카드들 */}
        {factDetails.map((fact) => (
          <Card
            key={fact.id}
            id={`fact-${fact.id}`}
            className={`w-full border-0 shadow-2xl overflow-hidden transition-all duration-500 ${activeFactId === fact.id ? 'ring-2 ring-green-500 ring-offset-2' : 'opacity-90 hover:opacity-100'
              }`}
          >
            <CardContent className="p-6 sm:p-8 w-full overflow-hidden">
              <div className="text-center mb-6 sm:mb-8 border-b border-gray-100 pb-6">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{fact.emoji}</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight break-words">
                  {fact.pageTitle}
                </h2>
                <p className="text-base sm:text-lg text-gray-600 font-medium break-words">
                  {fact.subtitle}
                </p>
              </div>

              <div className="space-y-8 sm:space-y-10">
                {fact.sections.map((section, index) => (
                  <div key={index} className="space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
                      {section.title}
                    </h3>
                    <div className="text-base sm:text-lg text-gray-700 leading-relaxed break-words">
                      {section.content}
                    </div>
                  </div>
                ))}

                {/* 출처 */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-5 text-sm sm:text-base text-gray-600">
                  <h4 className="font-bold mb-2">📚 출처 리포트</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {fact.sources.map((source, idx) => (
                      <li key={idx} className="break-words pl-1">{source}</li>
                    ))}
                  </ul>
                </div>

                {/* 닫는 메시지 */}
                <div className="bg-green-50 border-l-4 border-green-600 p-5 sm:p-6 rounded-r-xl">
                  <p className="font-medium text-green-900 text-base sm:text-lg italic leading-relaxed break-words">
                    &quot;{fact.closingMessage}&quot;
                  </p>
                </div>
              </div>
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
              <Link href="/test">
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
