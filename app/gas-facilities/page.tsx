"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 이 페이지는 홈(/)과 중복되어 리다이렉트됩니다
export default function GasFacilitiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
        <p className="text-gray-600">이동 중...</p>
      </div>
    </div>
  );
}
