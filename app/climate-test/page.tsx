"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClimateTestIntro() {
  const router = useRouter();

  useEffect(() => {
    // 기후시민 선언 페이지로 리다이렉트
    router.replace("/declaration");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-gray-600">이동 중...</p>
      </div>
    </div>
  );
}

