"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { initKakao, shareToKakao } from "@/lib/kakao";

function DeclareForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;
    const tryInitialize = () => {
      attempts++;
      const success = initKakao();
      if (!success && attempts < maxAttempts) setTimeout(tryInitialize, 500);
    };
    const timer = setTimeout(tryInitialize, 500);
    return () => clearTimeout(timer);
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    phone: "",
    consentPrivacy: false,
    consentMarketing: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const fromResult = searchParams.get("from") === "result";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.consentPrivacy) {
      alert("개인정보 수집에 동의해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const testType = searchParams.get("type");
      const sessionId = searchParams.get("session");

      const response = await fetch("/api/climate-test/declare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, testType, sessionId }),
      });

      if (response.ok) {
        if (fromResult) {
          router.push("/test/complete");
        } else {
          setCompleted(true);
        }
      } else {
        const error = await response.json();
        alert(error.message || "오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error submitting declaration:", error);
      alert("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg text-center">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
            기후시민이 되신 것을<br />환영합니다
          </h1>
          <p className="text-[15px] text-gray-500 mb-10">
            당신의 선언이 기후위기 대응에 큰 힘이 됩니다.
          </p>

          {/* 공유 */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              친구들에게도 알려주세요
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              더 많은 사람들이 기후시민이 될 수 있도록 함께해요.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/test`;
                  shareToKakao({
                    title: "나는 기후시민입니다!",
                    description: "기후위기에 맞서 행동하겠다는 선언에 참여하세요.\n1분 밸런스게임으로 나의 기후시민 유형도 알아보기!",
                    linkUrl: url,
                    buttonText: "나도 참여하기",
                    imageUrl: `${window.location.origin}/test.jpg`,
                  });
                }}
                className="h-11 bg-[#FEE500] hover:bg-[#F5DC00] text-gray-900 text-sm font-semibold rounded-xl transition-colors"
              >
                카카오톡 공유
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/test`);
                  alert("링크가 복사되었습니다!");
                }}
                className="h-11 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
              >
                링크 복사
              </button>
            </div>
          </div>

          {/* 테스트 */}
          <div className="rounded-xl bg-green-50 border border-green-200 p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              나의 기후시민 유형을 알아보세요
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              4문항 밸런스게���으로 나만의 기후시민 유형을 찾아보세요.
            </p>
            <button
              onClick={() => router.push("/test/take?from=declare")}
              className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors"
            >
              기후시민 유형 알아보기
            </button>
            <p className="text-xs text-gray-400 mt-3">약 1분 소요</p>
          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
            기후시민 선언
          </h1>
        </div>

        {/* 선언문 */}
        <div className="rounded-xl bg-green-50 border border-green-200 p-6 mb-10">
          <p className="text-[15px] font-bold text-gray-900 mb-4">
            나는 기후시민입니다.
          </p>
          <p className="text-[15px] text-gray-700 leading-relaxed">
            나는 기후위기가 우리 삶의 문제임을 인식하고,<br />
            석탄과 LNG를 넘어 타협 없는 재생에너지로의 전환을 지지하며,<br />
            일상의 실천과 정책적 변화를 함께 만들어가는 기후시민으로 행동할 것을 선언합니다.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="text"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="email"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-semibold text-gray-900 mb-2">
              지역 (시군구까지 입력) <span className="text-red-500">*</span>
            </label>
            <input
              id="region"
              type="text"
              required
              placeholder="예: 경남 창원시, 서울 구로구, 경기 연천군"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="text"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="tel"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-6">
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.consentPrivacy}
                  onChange={(e) => setFormData({ ...formData, consentPrivacy: e.target.checked })}
                  className="mt-0.5 w-[18px] h-[18px] shrink-0 accent-green-700"
                />
                <div>
                  <span className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                    개인정보 수집 및 이용에 동의합니다 (필수)
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    기후시민 선언 참여 및 관련 소식 전달을 위해 개인정보를 수집합니다.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.consentMarketing}
                  onChange={(e) => setFormData({ ...formData, consentMarketing: e.target.checked })}
                  className="mt-0.5 w-[18px] h-[18px] shrink-0 accent-green-700"
                />
                <div>
                  <span className="text-sm text-gray-800 group-hover:text-gray-900 transition-colors">
                    마케팅 정보 수신에 동의합니다 (선택)
                  </span>
                  <span className="block text-xs text-gray-400 mt-1">
                    기후 관련 캠페인 및 이벤트 정보를 받아보실 수 있습니다.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-2"
          >
            {submitting ? "제출 중..." : "선언하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function TestDeclarePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 text-sm">로딩 중...</div>
      </div>
    }>
      <DeclareForm />
    </Suspense>
  );
}
