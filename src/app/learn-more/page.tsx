"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { factDetails } from "@/data/factDetails";

function LearnMoreContent() {
  const searchParams = useSearchParams();
  const [activeFactId, setActiveFactId] = useState<number>(1);

  useEffect(() => {
    const factId = searchParams.get("fact");
    if (factId) {
      setActiveFactId(parseInt(factId));
      setTimeout(() => {
        const element = document.getElementById(`fact-${factId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white px-5 py-16">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="inline-block text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full mb-4">
            FACT CHECK
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
            기후위기, 더 깊이 알아보기
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            우리가 꼭 알아야 할 불편한 진실들을 팩트체크 해드립니다.
          </p>
        </div>

        {/* Fact cards */}
        <div className="space-y-8">
          {factDetails.map((fact) => (
            <article
              key={fact.id}
              id={`fact-${fact.id}`}
              className={`rounded-xl border p-6 transition-all ${
                activeFactId === fact.id
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {/* Fact header */}
              <div className="mb-6">
                <div className="text-3xl mb-3">{fact.emoji}</div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {fact.pageTitle}
                </h2>
                <p className="text-sm text-gray-500">{fact.subtitle}</p>
              </div>

              {/* Sections */}
              <div className="space-y-5 mb-6">
                {fact.sections.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                      {section.title}
                    </h3>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {section.content}
                    </div>
                    {section.sources && section.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <ul className="space-y-0.5">
                          {section.sources.map((src, idx) => (
                            <li key={idx} className="text-[11px] text-gray-400 flex items-start gap-1.5">
                              <span className="text-gray-300 mt-0.5 shrink-0">📎</span>
                              {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Closing message */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 mb-4">
                <p className="text-sm text-gray-700 italic leading-relaxed">
                  &quot;{fact.closingMessage}&quot;
                </p>
              </div>

            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-green-700 p-8 mt-12 text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            지금이 바로, 기후시민이 되어야 할 때
          </h2>
          <p className="text-sm text-green-200 mb-6 leading-relaxed">
            우리의 작은 실천들이 모여 세상의 큰 변화를 만들어냅니다.<br />
            LNG 발전소 건설을 막고, 지속가능한 미래를 함께 만들어주세요.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/test"
              className="h-12 px-8 bg-white hover:bg-green-50 text-green-800 text-[15px] font-semibold rounded-xl transition-colors inline-flex items-center justify-center"
            >
              기후시민 선언하기
            </Link>
            <Link
              href="/"
              className="h-12 px-8 border border-white/30 hover:bg-white/10 text-white text-[15px] font-semibold rounded-xl transition-colors inline-flex items-center justify-center"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>

        {/* External links */}
        <div className="text-center mt-10 pb-4">
          <p className="text-xs text-gray-400 mb-3">공식 리포트</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: "IPCC 보고서", href: "https://www.ipcc.ch/" },
              { label: "국제에너지기구(IEA)", href: "https://www.iea.org/" },
              { label: "국제재생에너지기구(IRENA)", href: "https://www.irena.org/" },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-500 font-medium hover:bg-gray-100 transition-colors"
              >
                {link.label}
              </a>
            ))}
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
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
            <p className="text-sm text-gray-400">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LearnMoreContent />
    </Suspense>
  );
}
