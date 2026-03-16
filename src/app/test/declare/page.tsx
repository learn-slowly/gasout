"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function DeclareForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    phone: "",
    consentPrivacy: false,
    consentMarketing: false,
  });
  const [submitting, setSubmitting] = useState(false);

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
        router.push("/test/complete");
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">
            기후시민 선언
          </h1>
          <p className="text-[15px] text-gray-500 leading-relaxed">
            기후위기에 맞서 행동하겠다는 의지를 선언해주세요.
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
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="email"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-semibold text-gray-900 mb-2">
              지역
            </label>
            <input
              id="region"
              type="text"
              placeholder="예: 경남 양산시"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="w-full h-12 px-4 text-base text-gray-900 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition-colors placeholder:text-gray-400"
              inputMode="text"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-2">
              전화번호
            </label>
            <input
              id="phone"
              type="tel"
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
