"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { initKakao, shareToKakao } from "@/src/lib/kakao";

export default function ClimateDeclareComplete() {
  const router = useRouter();

  // 카카오 SDK 초기화
  useEffect(() => {
    console.log('[Declare Complete] Attempting to initialize Kakao SDK...');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryInitialize = () => {
      attempts++;
      const success = initKakao();
      
      if (!success && attempts < maxAttempts) {
        setTimeout(tryInitialize, 500);
      }
    };
    
    const timer = setTimeout(tryInitialize, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/declaration`;
    const text = "나는 기후시민입니다! 당신도 함께해요!";

    switch (platform) {
      case "kakao":
        shareToKakao({
          title: "🌱 기후시민 선언",
          description: "기후위기에 맞서는 첫걸음을 함께해요!\n\n나도 기후시민 MBTI 테스트하고 선언하기",
          linkUrl: url,
          buttonText: '나도 테스트하기',
          imageUrl: `${window.location.origin}/climate-mbti-og.png`,
        });
        break;
        
      case "url":
        navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다!");
        break;
        
      default:
        if (navigator.share) {
          navigator.share({
            title: "기후시민 선언",
            text: text,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-2xl max-w-full overflow-hidden">
        <Card className="w-full max-w-full border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 md:p-12 text-center space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
            {/* 축하 아이콘 */}
            <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
            
            {/* 메인 메시지 */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight px-2 break-words overflow-wrap-anywhere w-full max-w-full">
              기후시민이 되신 것을 환영합니다!
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-2 break-words overflow-wrap-anywhere w-full max-w-full">
              당신의 선언이 기후위기 대응에 큰 힘이 됩니다.
            </p>

            {/* 공유하기 섹션 */}
            <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-200 rounded-xl p-5 sm:p-6 space-y-4 w-full max-w-full overflow-hidden">
              <div className="text-3xl sm:text-4xl">🌱</div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words overflow-wrap-anywhere">
                친구들에게도 알려주세요!
              </h2>
              <p className="text-sm sm:text-base text-gray-700 break-words overflow-wrap-anywhere">
                더 많은 사람들이 기후시민이 될 수 있도록 함께해요
              </p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                <Button
                  onClick={() => handleShare("kakao")}
                  className="bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-semibold min-h-[48px] touch-manipulation text-sm sm:text-base whitespace-normal"
                >
                  카카오톡 공유
                </Button>
                <Button
                  onClick={() => handleShare("url")}
                  variant="outline"
                  className="bg-white border-2 border-blue-400 hover:bg-blue-50 min-h-[48px] touch-manipulation text-sm sm:text-base whitespace-normal"
                >
                  링크 복사
                </Button>
              </div>
            </div>

            {/* 다음 단계 */}
            <div className="bg-green-50 rounded-xl p-5 sm:p-6 space-y-3 sm:space-y-4 text-left w-full max-w-full overflow-hidden">
              <h2 className="font-semibold text-gray-900 text-base sm:text-lg break-words overflow-wrap-anywhere">다음 단계</h2>
              <ul className="space-y-2 text-gray-700 text-sm sm:text-base leading-relaxed w-full max-w-full">
                <li className="break-words overflow-wrap-anywhere">• 지역 기후 모임에 참여해보세요</li>
                <li className="break-words overflow-wrap-anywhere">• LNG 발전소 반대 운동에 동참하세요</li>
              </ul>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3 sm:space-y-4 pt-2 w-full max-w-full overflow-hidden">
              <Button
                onClick={() => router.push("/")}
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-base sm:text-lg font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] whitespace-normal"
              >
                홈으로 돌아가기
              </Button>
              <Button
                onClick={() => router.push("/declaration")}
                variant="outline"
                className="w-full min-h-[48px] touch-manipulation text-sm sm:text-base whitespace-normal"
              >
                테스트 다시 하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
