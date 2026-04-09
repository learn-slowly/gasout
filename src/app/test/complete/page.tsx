"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { initKakao, shareToKakao } from "@/lib/kakao";

export default function TestCompletePage() {
  const router = useRouter();

  useEffect(() => {
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
    const url = `${window.location.origin}/test`;

    switch (platform) {
      case "kakao":
        shareToKakao({
          title: "나는 기후시민입니다!",
          description: "LNG 발전소 건설을 막고, 재생에너지로 전환하는 첫걸음!\n1분 밸런스게임으로 나�� 기후시민 유형 알아보기",
          linkUrl: url,
          buttonText: '나도 테스트하기',
          imageUrl: `${window.location.origin}/test.jpg`,
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
            text: "나는 기후시민입니다! 당신도 함께해요!",
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
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
            기후시민이 되신 것을<br />환영합니다
          </h1>
          <p className="text-[15px] text-gray-500">
            당신의 선언이 기후위기 대응에 큰 힘이 됩니다.
          </p>
        </div>

        {/* Share */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">
            친구들에게도 알려주세요
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            더 많은 사람들이 기후시민이 될 수 있도록 함께해요.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare("kakao")}
              className="h-11 bg-[#FEE500] hover:bg-[#F5DC00] text-gray-900 text-sm font-semibold rounded-xl transition-colors"
            >
              카카오톡 공유
            </button>
            <button
              onClick={() => handleShare("url")}
              className="h-11 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              링크 복사
            </button>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 mb-10">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">다음 단계</h2>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">&#8226;</span>
              지역 기후 모임에 참여해보세요
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">&#8226;</span>
              LNG 발전소 반대 운동에 동참하세요
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <button
          onClick={() => router.push("/")}
          className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors mb-3"
        >
          홈으로 돌아가기
        </button>
        <button
          onClick={() => router.push("/test")}
          className="w-full h-11 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          테스트 다시 하기
        </button>
      </div>
    </div>
  );
}
