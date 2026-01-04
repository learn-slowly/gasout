"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// 스크롤 애니메이션을 위한 컴포넌트
function ScrollAnimate({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8'
        }`}
    >
      {children}
    </div>
  );
}

// 왼쪽에서 등장하는 애니메이션 컴포넌트
function SlideInLeft({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-800 ease-out ${isVisible
        ? 'opacity-100 translate-x-0'
        : 'opacity-0 -translate-x-8'
        }`}
    >
      {children}
    </div>
  );
}

// 순차적으로 나타나는 애니메이션 컴포넌트
function StaggeredFadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-4'
        }`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">


      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto p-4 sm:p-8 lg:p-10 animate-fade-in-up">
        <div className="space-y-10">
          {/* GasOut이란? */}
          <ScrollAnimate delay={0}>
            <Card className="border-0 shadow-xl shadow-slate-900/10 glass-card ring-1 ring-white/20 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-slate-900 rounded-full"></div>
                  GasOut이란?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 space-y-6 sm:space-y-8 bg-slate-50/30">
                <StaggeredFadeIn delay={0}>
                  <p className="text-lg text-slate-700 leading-relaxed font-medium">
                    우리는 경남기후위기비상행동에서 전국의 탈가스 탈 LNG 운동을 고민하고 있는 활동가들입니다.
                  </p>
                </StaggeredFadeIn>

                <SlideInLeft delay={300}>
                  <div className="py-6 px-8 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-xl font-bold text-amber-800 leading-relaxed text-center">
                      "왜 <span className="text-amber-600">경남</span> 기후위기비상행동이 <span className="text-amber-600">전국</span>의 탈가스 운동을 고민하는지 궁금하실겁니다."
                    </p>
                  </div>
                </SlideInLeft>

                <StaggeredFadeIn delay={600}>
                  <p className="text-slate-600 leading-relaxed">
                    우리는 지난 2023년, 하동석탄화력발전소 1호기가 폐지되는 대신, 한국남부발전이 안동에 LNG 복합화력발전소 2호기를 건설하겠다는 계획을 밝히는 장면을 목격했습니다. 우리 지역의 오염과 위험을 다른 지역이 떠안게 되는 광경을 말입니다.
                  </p>
                </StaggeredFadeIn>

                <StaggeredFadeIn delay={900}>
                  <div className="bg-slate-900 p-6 rounded-xl shadow-lg shadow-slate-900/10 text-center transform hover:scale-[1.02] transition-transform duration-300">
                    <p className="text-white leading-relaxed font-bold text-lg">
                      결국 전국적인 운동만이 실제로 기후위기를 해결할 수 있다는 것을 알게 되었습니다.
                    </p>
                  </div>
                </StaggeredFadeIn>

                <SlideInLeft delay={1200}>
                  <div className="py-4 border-t border-b border-slate-200">
                    <p className="text-xl font-bold text-slate-800 leading-relaxed text-center">
                      왜 하필 <span className="text-blue-600">LNG</span>냐 궁금하실겁니다.
                    </p>
                  </div>
                </SlideInLeft>

                <StaggeredFadeIn delay={1500}>
                  <p className="text-slate-600 leading-relaxed">
                    우리는 석탄발전소를 빠른 시일내에 꺼야한다는 것에 대해서는 시민적 합의가 이루어졌다고 믿습니다. 재생에너지가 지구의 미래라는 것에 대해서도 이견이 없다고 생각합니다. 하지만 지금 당장 석탄발전소를 재생에너지로 바로 이어가지 못하고, 굳이 브릿지 전원이라는 이름으로 LNG발전을 경유하려는 것에 대해서 우려를 갖고 있습니다.
                  </p>
                </StaggeredFadeIn>

                <StaggeredFadeIn delay={1800}>
                  <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500 shadow-sm">
                    <h4 className="font-bold text-red-800 mb-2 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      LNG의 문제점
                    </h4>
                    <p className="text-slate-700 leading-relaxed text-sm">
                      LNG발전은 여전히 탄소를 발생시키며, 메탄가스가 샙니다. 절대로 탄소중립을 가능하게 하는 발전원이 아닙니다. 연료는 수입해야하고, 비쌉니다. 더구나 11차 전력수급기본계획에 따르면 LNG발전 설비는 터무니 없이 증가하는데, 지금도 이미 LNG발전의 가동량은 전체 설비의 절반 수준이고, 2036년에는 11%대로 내려갑니다.
                    </p>
                  </div>
                </StaggeredFadeIn>

                <StaggeredFadeIn delay={2100}>
                  <div className="bg-slate-100 p-6 rounded-xl text-center">
                    <p className="text-slate-800 leading-relaxed font-semibold">
                      "LNG발전은 우리의 미래가 아니며, 발전산업의 이해관계가 얽혀 일어난 산물입니다."
                    </p>
                  </div>
                </StaggeredFadeIn>
              </CardContent>
            </Card>
          </ScrollAnimate>

          {/* 주요 기능 */}
          <ScrollAnimate delay={200}>
            <Card className="border-0 shadow-xl shadow-slate-900/10 glass-card ring-1 ring-white/20 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-emerald-500 rounded-full"></div>
                  주요 기능
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 bg-slate-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">LNG 시설 통합 지도</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">전국 LNG 발전소와 터미널을 통합 지도에 표시합니다. 유형별/분류별로 구분하여 직관적으로 확인할 수 있습니다.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">실시간 관련 뉴스</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">LNG 인프라 관련 뉴스를 전국/지역/발전소별로 분류하여 실시간으로 수집하고 제공합니다.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">실시간 통계 대시보드</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">시설 현황, 총 용량, 운영 상태 등을 실시간으로 집계하여 시각적인 대시보드로 제공합니다.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">고급 필터링</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">다양한 조건(유형, 상태, 분류 등)으로 시설을 필터링하여 원하는 정보를 빠르게 찾을 수 있습니다.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimate>

          {/* 데이터 현황 */}
          <ScrollAnimate delay={400}>
            <Card className="border-0 shadow-xl shadow-slate-900/10 glass-card ring-1 ring-white/20 rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-white/50 backdrop-blur-sm pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                  데이터 현황
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 bg-slate-50/30">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:scale-105 transition-transform duration-200">
                    <div className="text-4xl font-black text-slate-900 mb-2">267<span className="text-lg font-normal text-slate-400 ml-1">개</span></div>
                    <div className="text-sm font-bold text-slate-600">총 시설</div>
                    <div className="text-xs text-slate-400 mt-1">발전소 + 터미널</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:scale-105 transition-transform duration-200">
                    <div className="text-4xl font-black text-blue-600 mb-2">144<span className="text-lg font-normal text-slate-400 ml-1">개</span></div>
                    <div className="text-sm font-bold text-slate-600">LNG 발전소</div>
                    <div className="text-xs text-slate-400 mt-1">복합/열병합</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:scale-105 transition-transform duration-200">
                    <div className="text-4xl font-black text-red-600 mb-2">123<span className="text-lg font-normal text-slate-400 ml-1">개</span></div>
                    <div className="text-sm font-bold text-slate-600">LNG 터미널</div>
                    <div className="text-xs text-slate-400 mt-1">가스공사/민간</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-100 text-center hover:scale-105 transition-transform duration-200">
                    <div className="text-4xl font-black text-emerald-600 mb-2">ON</div>
                    <div className="text-sm font-bold text-slate-600">실시간 수집</div>
                    <div className="text-xs text-slate-400 mt-1">뉴스 모니터링</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimate>

          {/* 참여해 주세요 */}
          <ScrollAnimate delay={600}>
            <Card className="border-0 shadow-xl shadow-slate-900/10 glass-card ring-1 ring-white/20 rounded-3xl overflow-hidden">
              <CardHeader className="pb-6 border-b border-slate-100 bg-white/50 backdrop-blur-sm">
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-slate-900 rounded-full"></div>
                  참여해 주세요
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 sm:p-8 bg-slate-50/30">
                <div className="space-y-8">
                  <p className="text-slate-600 leading-relaxed text-lg">
                    GasOut 프로젝트는 전국의 탈가스 탈 LNG 운동을 위한 정보 플랫폼입니다.
                    LNG 발전소와 터미널의 현황을 한눈에 파악하고, 관련 뉴스를 실시간으로 확인할 수 있습니다.
                    더 많은 시민들이 참여할 수 있도록 도와주세요.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 hover:scale-105 transition-transform duration-200">
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                        참여 방법
                      </h3>
                      <ul className="text-slate-600 space-y-2 text-sm">
                        <li className="flex items-center gap-2">✓ LNG 발전소 및 터미널 관련 정보 제공</li>
                        <li className="flex items-center gap-2">✓ LNG 인프라 관련 뉴스 정보 공유</li>
                        <li className="flex items-center gap-2">✓ 지역별 탈가스 활동 공유</li>
                        <li className="flex items-center gap-2">✓ 페이지 피드백 및 개선 제안</li>
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 flex flex-col justify-center items-center text-center hover:scale-105 transition-transform duration-200">
                      <p className="text-slate-600 mb-4">
                        경남기후위기비상행동으로 연락주시면<br />언제든 함께할 수 있습니다.
                      </p>
                      <Button className="bg-slate-900 text-white hover:bg-slate-800 font-bold">
                        연락하기
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollAnimate>
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-12 text-center pb-12">
          <Link href="/">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              메인 페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
