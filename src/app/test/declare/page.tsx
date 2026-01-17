"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          testType,
          sessionId,
        }),
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-2xl overflow-hidden">
        <Card className="w-full border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-6 sm:p-8 md:p-12 w-full overflow-hidden">
            <div className="space-y-5 sm:space-y-6 w-full overflow-hidden">
              <div className="text-center w-full overflow-hidden">
                <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">🌱</div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight break-words w-full px-2">
                  기후시민 선언
                </h1>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2 break-words w-full">
                  기후위기에 맞서 행동하겠다는 의지를 선언해주세요
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <div>
                  <Label htmlFor="name" className="text-sm sm:text-base font-bold text-gray-900">이름 *</Label>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg touch-manipulation text-gray-900"
                    inputMode="text"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm sm:text-base font-bold text-gray-900">이메일 *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg touch-manipulation text-gray-900"
                    inputMode="email"
                  />
                </div>

                <div>
                  <Label htmlFor="region" className="text-sm sm:text-base font-bold text-gray-900">지역</Label>
                  <Input
                    id="region"
                    type="text"
                    placeholder="예: 경남 양산시"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg touch-manipulation text-gray-900"
                    inputMode="text"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm sm:text-base font-bold text-gray-900">전화번호</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="mt-2 h-12 sm:h-14 text-base sm:text-lg touch-manipulation text-gray-900"
                    inputMode="tel"
                  />
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consentPrivacy"
                      required
                      checked={formData.consentPrivacy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consentPrivacy: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 touch-manipulation"
                    />
                    <label
                      htmlFor="consentPrivacy"
                      className="text-sm sm:text-base text-gray-700 cursor-pointer leading-relaxed flex-1"
                    >
                      개인정보 수집 및 이용에 동의합니다. (필수)
                      <br />
                      <span className="text-gray-500 text-xs sm:text-sm block mt-1">
                        기후시민 선언 참여 및 관련 소식 전달을 위해 개인정보를
                        수집합니다.
                      </span>
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="consentMarketing"
                      checked={formData.consentMarketing}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          consentMarketing: e.target.checked,
                        })
                      }
                      className="mt-1 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 touch-manipulation"
                    />
                    <label
                      htmlFor="consentMarketing"
                      className="text-sm sm:text-base text-gray-700 cursor-pointer leading-relaxed flex-1"
                    >
                      마케팅 정보 수신에 동의합니다. (선택)
                      <br />
                      <span className="text-gray-500 text-xs sm:text-sm block mt-1">
                        기후 관련 캠페인 및 이벤트 정보를 받아보실 수 있습니다.
                      </span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-base sm:text-lg font-semibold py-5 sm:py-6 rounded-xl shadow-lg hover:shadow-xl active:shadow-md transition-all touch-manipulation min-h-[56px] disabled:opacity-50 whitespace-normal"
                >
                  {submitting ? "제출 중..." : "기후시민 선언하기"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TestDeclarePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <DeclareForm />
    </Suspense>
  );
}

