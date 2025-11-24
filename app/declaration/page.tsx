"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeclarationPage() {
    const router = useRouter();

    const handleStartTest = () => {
        router.push("/climate-test/take");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4 pb-safe overflow-x-hidden w-full max-w-full">
            <main className="max-w-2xl w-full max-w-full animate-fade-in-up overflow-hidden">
                <Card className="border-0 shadow-2xl w-full max-w-full overflow-hidden">
                    <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
                        {/* 헤더 */}
                        <div className="space-y-3 sm:space-y-4 w-full max-w-full overflow-hidden">
                            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🌍</div>
                            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight break-words overflow-wrap-anywhere w-full max-w-full px-2">
                                나의 기후행동 스타일은?
                            </CardTitle>
                            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
                                MBTI 스타일의 성향 테스트로<br className="hidden sm:block" />
                                <span className="sm:hidden"> </span>당신에게 맞는 기후행동 방법을 찾아보세요
                            </p>
                        </div>

                        {/* 정보 카드 */}
                        <div className="bg-green-50 rounded-xl p-5 sm:p-6 space-y-4 sm:space-y-3 text-left w-full max-w-full overflow-hidden">
                            <div className="flex items-start gap-3 w-full max-w-full min-w-0">
                                <span className="text-xl sm:text-2xl flex-shrink-0">⏱️</span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words overflow-wrap-anywhere">소요 시간</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 break-words overflow-wrap-anywhere">약 3분</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 w-full max-w-full min-w-0">
                                <span className="text-xl sm:text-2xl flex-shrink-0">❓</span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words overflow-wrap-anywhere">질문 수</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 break-words overflow-wrap-anywhere">총 20개 질문</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 w-full max-w-full min-w-0">
                                <span className="text-xl sm:text-2xl flex-shrink-0">🎯</span>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base break-words overflow-wrap-anywhere">결과</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 break-words overflow-wrap-anywhere">
                                        16가지 기후행동 유형 중 당신의 스타일
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 설명 */}
                        <div className="bg-blue-50 rounded-xl p-5 sm:p-6 text-left w-full max-w-full overflow-hidden">
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words overflow-wrap-anywhere">📢 기후시민 선언</h3>
                            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full">
                                테스트를 완료하시면 기후위기에 맞서 행동하겠다는 의지를 선언하실 수 있습니다.
                                <br className="hidden sm:block" />
                                <span className="sm:hidden"> </span>당신의 선언이 기후위기 대응에 큰 힘이 됩니다.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3 sm:space-y-4 pt-2">
                            <Button
                                onClick={handleStartTest}
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-base sm:text-lg font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] whitespace-normal"
                            >
                                테스트 시작하기
                            </Button>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
                                테스트를 통해 LNG 발전소의 진실과<br className="hidden sm:block" />
                                <span className="sm:hidden"> </span>나에게 맞는 기후행동 방법을 알아보세요
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
