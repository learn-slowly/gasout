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
                                지금, 기후시민으로서<br />행동할 수 있습니다!
                            </CardTitle>
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
                                경남기후위기비상행동이 함께하는<br />
                                <strong className="text-green-700">'기후시민 선언'</strong>에 참여해<br />
                                친환경 에너지 전환을 지지하고,<br />
                                더 나은 지역의 미래를 함께 만들어주세요.
                            </p>
                        </div>

                        {/* 왜 필요한가 */}
                        <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 sm:p-6 text-left w-full max-w-full overflow-hidden">
                            <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg break-words overflow-wrap-anywhere">
                                💡 왜 지금 '기후시민 선언'이 필요할까?
                            </h3>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full mb-3">
                                기후위기는 더 이상 먼 미래의 문제가 아니야. 우리의 건강·경제·지역의 지속가능성을 좌우하는 현실적인 과제이지!
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full mb-3">
                                석탄을 LNG로 바꾸는 것은 나쁜 것을 다른 나쁜 것으로 바꾸는 거야.
                            </p>
                            <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words overflow-wrap-anywhere w-full max-w-full">
                                우리가 바라는 에너지 전환은 모두가 참여하는 정의로운 방식으로 친환경 재생에너지 중심의 체계로 이동하는 거야! 
                                그 중심에 <strong className="text-green-700">정의로운 에너지 전환</strong>이 있어.
                            </p>
                        </div>

                        {/* 우리에게 필요한 것 */}
                        <div className="bg-blue-50 rounded-xl p-5 sm:p-6 text-left w-full max-w-full overflow-hidden">
                            <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg break-words overflow-wrap-anywhere">
                                🌱 우리에게 필요한 건?
                            </h3>
                            <p className="text-lg sm:text-xl font-bold text-green-700 break-words overflow-wrap-anywhere w-full max-w-full">
                                분산형·친환경 재생에너지 중심의 미래
                            </p>
                        </div>

                        {/* MBTI 테스트 안내 */}
                        <div className="bg-purple-50 rounded-xl p-5 sm:p-6 text-left w-full max-w-full overflow-hidden">
                            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words overflow-wrap-anywhere">
                                🎯 이어서 진행되는 나만의 기후시민 MBTI 테스트도 즐겨보세요!
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 break-words overflow-wrap-anywhere w-full max-w-full">
                                당신에게 맞는 기후행동 방법을 찾아보세요
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3 sm:space-y-4 pt-2">
                            <Button
                                onClick={handleStartTest}
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-base sm:text-lg font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] whitespace-normal"
                            >
                                기후시민 선언 & 테스트 시작
                            </Button>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
                                선언 후 나만의 기후시민 MBTI를 확인해보세요!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

