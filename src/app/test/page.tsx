"use client";

import { useRouter } from "next/navigation";

export default function TestStartPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-lg">

        <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
          나는 어떤 기후시민일까?
        </h1>

        <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed mb-8">
          <p>
            기후위기 앞에서 사람들은 각자 다른 방식으로 반응합니다.
          </p>
          <p>
            4개의 질문으로 당신의 기후시민 유형을 알아보세요.
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">밸런스게임</h3>
          <p className="text-[15px] font-bold text-gray-900">
            4문항 · 1분이면 끝
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/test/take")}
            className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors"
          >
            기후시민 유형 알아보기
          </button>
          <button
            onClick={() => router.push("/test/declare")}
            className="w-full h-13 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-[15px] font-semibold rounded-xl transition-colors"
          >
            바로 기후시민 선언하기
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          밸런스게임 4문항 · 약 1분 소요
        </p>
      </div>
    </div>
  );
}
