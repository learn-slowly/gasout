"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-white pt-20 sm:pt-24 p-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
        {/* 헤더 */}
        <div className="text-center max-w-2xl mx-auto">
          <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200 px-4 py-1.5 text-sm font-bold rounded-full transition-colors">
            FACT CHECK
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
            기후위기,<br className="sm:hidden" /> 더 깊이 알아보기
          </h1>
          <p className="text-gray-500 text-lg sm:text-xl font-medium leading-relaxed">
            우리가 꼭 알아야 할 불편한 진실들을<br className="sm:hidden" /> 팩트체크 해드립니다.
          </p>
        </div>

        {/* 팩트 카드 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {factDetails.map((fact) => (
            <Card
              key={fact.id}
              id={`fact-${fact.id}`}
              className={`group border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 rounded-[2rem] overflow-hidden bg-white h-full flex flex-col ${activeFactId === fact.id ? 'ring-2 ring-green-500 ring-offset-4' : ''
                }`}
            >
              <CardContent className="p-0 flex flex-col h-full bg-white">
                {/* 카드 헤더 */}
                <div className="p-8 bg-gray-50/50 border-b border-gray-100 group-hover:bg-green-50/30 transition-colors duration-500">
                  <div className="text-5xl mb-5 transform group-hover:scale-110 transition-transform duration-500 origin-left filter drop-shadow-sm">
                    {fact.emoji}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight tracking-tight">
                    {fact.pageTitle}
                  </h2>
                  <p className="text-gray-500 font-medium leading-relaxed">
                    {fact.subtitle}
                  </p>
                </div>

                {/* 카드 본문 */}
                <div className="p-8 space-y-8 flex-1">
                  {fact.sections.map((section, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {section.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                        {section.content}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 space-y-4">
                    {/* 닫는 메시지 */}
                    <div className="p-5 rounded-2xl bg-green-50/50 border border-green-100 text-green-800 text-sm font-medium italic leading-relaxed">
                      &quot;{fact.closingMessage}&quot;
                    </div>

                    {/* 출처 */}
                    <div className=" rounded-2xl p-4 bg-gray-50 border border-gray-100">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Sources</h4>
                      <ul className="space-y-1">
                        {fact.sources.map((source, idx) => (
                          <li key={idx} className="text-xs text-gray-500 truncate flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0"></span>
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 하단 CTA */}
        <div className="max-w-4xl mx-auto pt-8 sm:pt-16">
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-green-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <CardContent className="p-8 sm:p-12 md:p-16 text-center relative z-10">
              <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-sm px-4 py-1.5">
                함께 행동해요
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                지금이 바로,<br />
                기후시민이 되어야 할 때
              </h2>
              <p className="text-gray-300 mb-10 text-lg sm:text-xl leading-relaxed max-w-2xl mx-auto">
                우리의 작은 실천들이 모여<br className="sm:hidden" /> 세상의 큰 변화를 만들어냅니다.<br />
                LNG 발전소 건설을 막고, 지속가능한 미래를 함께 만들어주세요.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/test" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-400 text-white font-bold px-10 h-14 rounded-full text-lg shadow-lg shadow-green-500/30 transition-all hover:scale-105"
                  >
                    기후시민 선언하기
                  </Button>
                </Link>
                <Link href="/" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:border-white/30 font-bold px-10 h-14 rounded-full text-lg backdrop-blur-sm transition-all"
                  >
                    홈으로 돌아가기
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추가 자료 링크 */}
        <div className="text-center pb-12">
          <p className="text-gray-400 text-sm font-medium mb-4">
            더 자세한 공식 리포트 확인하기
          </p>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
            <a
              href="https://www.ipcc.ch/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span>🌍</span> IPCC 보고서
            </a>
            <a
              href="https://www.iea.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span>⚡</span> 국제에너지기구(IEA)
            </a>
            <a
              href="https://www.irena.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-gray-50 text-gray-600 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <span>☀️</span> 국제재생에너지기구(IRENA)
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
