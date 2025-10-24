"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">GasOut 프로젝트</h1>
              <p className="text-sm text-gray-600">프로젝트 소개</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" size="sm">
              메인으로
            </Button>
          </Link>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          {/* GasOut이란? */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-blue-600">GasOut이란?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                우리는 경남기후위기비상행동에서 전국의 탈가스 탈 LNG 운동을 고민하고 있는 활동가들입니다.
              </p>
              
              <div className="py-4">
              <p className="text-2xl font-bold text-yellow-600 leading-relaxed text-center">
                  왜 "경남" 기후위기비상행동이 "전국"의 탈가스 운동을 고민하는지 궁금하실겁니다.
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                우리는 지난 2023년, 하동석탄화력발전소 1호기가 폐지되는 대신, 한국남부발전이 안동에 LNG 복합화력발전소 2호기를 건설하겠다는 계획을 밝히는 장면을 목격했습니다. 우리 지역의 오염과 위험을 다른 지역이 떠안게 되는 광경을 말입니다. 
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed font-medium">
                  결국 전국적인 운동만이 실제로 기후위기를 해결할 수 있다는 것을 알게 되었습니다.
                </p>
              </div>
              
              <div className="py-4">
                <p className="text-2xl font-bold text-yellow-600 leading-relaxed text-center">
                  왜 하필 LNG냐 궁금하실겁니다.
                </p>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                우리는 석탄발전소를 빠른 시일내에 꺼야한다는 것에 대해서는 시민적 합의가 이루어졌다고 믿습니다. 재생에너지가 지구의 미래라는 것에 대해서도 이견이 없다고 생각합니다. 하지만 지금 당장 석탄발전소를 재생에너지로 바로 이어가지 못하고, 굳이 브릿지 전원이라는 이름으로 LNG발전을 경유하려는 것에 대해서 우려를 갖고 있습니다.
              </p>
              
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                <p className="text-gray-700 leading-relaxed">
                  LNG발전은 여전히 탄소를 발생시키며, 메탄가스가 샙니다. 절대로 탄소중립을 가능하게 하는 발전원이 아닙니다. 연료는 수입해야하고, 비쌉니다. 더구나 11차 전력수급기본계획에 따르면 LNG발전 설비는 터무니 없이 증가하는데, 지금도 이미 LNG발전의 가동량은 전체 설비의 절반 수준이고, 2036년에는 11%대로 내려갑니다.
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700 leading-relaxed font-medium text-center">
                  LNG발전은 우리의 미래가 아니며, 발전산업의 이해관계가 얽혀 일어난 산물입니다.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 주요 기능 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">주요 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">전국 발전소 현황 지도</h3>
                    <p className="text-sm text-gray-600">전국 615개 발전소를 연료 유형별 색상으로 구분하여 지도에 표시</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">발전소별 관련 뉴스</h3>
                    <p className="text-sm text-gray-600">각 발전소와 관련된 뉴스를 실시간으로 수집하고 분류하여 제공</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">실시간 통계 대시보드</h3>
                    <p className="text-sm text-gray-600">발전소 현황과 뉴스 현황을 실시간으로 집계하여 표시</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">모바일 최적화</h3>
                    <p className="text-sm text-gray-600">모바일 환경에서도 편리하게 사용할 수 있도록 최적화된 인터페이스</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 현황 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-orange-600">데이터 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">615개</div>
                  <div className="text-sm text-gray-600">전국 발전소</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">실시간</div>
                  <div className="text-sm text-gray-600">뉴스 수집</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 참여해 주세요 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-red-600">참여해 주세요</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  GasOut 프로젝트는 전국의 탈가스 탈 LNG 운동을 위한 정보 플랫폼입니다. 
                  더 많은 시민들이 참여할 수 있도록 도와주세요.
                </p>
                
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                  <h3 className="font-semibold text-red-800 mb-2">참여 방법</h3>
                  <ul className="text-red-700 space-y-1">
                    <li>• 발전소 관련 정보 제공</li>
                    <li>• 뉴스 정보 공유</li>
                    <li>• 지역별 활동 공유</li>
                    <li>• 페이지 피드백 및 개선 제안</li>
                  </ul>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    경남기후위기비상행동으로 연락주시면 참여할 수 있습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 네비게이션 */}
        <div className="mt-8 text-center">
          <Link href="/">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              메인 페이지로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
