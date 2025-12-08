"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default function TestStartPage() {
    const router = useRouter();

    const handleStartTest = () => {
        router.push("/test/take");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-12 sm:pt-16 p-4 pb-safe overflow-x-hidden w-full max-w-full">
            <main className="max-w-2xl w-full animate-fade-in-up overflow-hidden">
                <Card className="border-0 shadow-2xl w-full overflow-hidden">
                    <CardContent className="p-6 sm:p-8 text-center space-y-5 sm:space-y-6 w-full overflow-hidden">
                        {/* 헤더 */}
                        <div className="space-y-2 sm:space-y-3 w-full overflow-hidden">
                            <div className="text-5xl sm:text-6xl mb-2">🌍</div>
                            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight break-words px-2">
                                지금, 기후시민으로서<br />행동할 수 있습니다!
                            </CardTitle>
                            <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-2 break-words">
                                경남기후위기비상행동과 함께 <br /><strong className="text-green-700">&apos;기후시민 선언&apos;</strong>에 참여해 <br />친환경 에너지 전환을 지지하고, <br />더 나은 지역의 미래를 만들어주세요.
                            </p>
                        </div>

                        {/* MBTI 테스트 안내 */}
                        <div className="bg-purple-50 rounded-xl p-5 sm:p-6 text-center w-full overflow-hidden">
                            <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg break-words">
                                🎯 나만의 기후시민 MBTI 테스트로 당신에게 맞는 기후행동 방법을 찾아보세요
                            </h3>
                        </div>

                        {/* CTA */}
                        <div className="space-y-3 sm:space-y-4 pt-2">
                            <Button
                                onClick={handleStartTest}
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-base sm:text-lg font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] whitespace-normal"
                            >
                                기후시민 선언 &amp; 테스트 시작
                            </Button>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed px-2 break-words">
                                내가 어떤 기후시민인지 알아보고 기후시민 선언에 함께해요
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

