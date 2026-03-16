"use client";

import { useRouter } from "next/navigation";

export default function TestStartPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
            <div className="w-full max-w-lg">

                <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
                    지금, 기후시민으로서<br />행동할 수 있습니다
                </h1>

                <div className="space-y-4 text-[15px] text-gray-600 leading-relaxed mb-8">
                    <p>
                        기후위기는 더 이상 먼 미래의 문제가 아닙니다. 우리의 건강, 경제, 지역의 지속가능성을 좌우하는 현실적인 과제입니다.
                    </p>
                    <p>
                        석탄을 LNG로 바꾸는 것은 나쁜 것을 다른 나쁜 것으로 바꾸는 것입니다.
                    </p>
                </div>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10">
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">우리에게 필요한 건?</h3>
                    <p className="text-[15px] font-bold text-gray-900">
                        분산형 · 친환경 재생에너지 중심의 미래
                    </p>
                </div>

                <button
                    onClick={() => router.push("/test/take")}
                    className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors"
                >
                    테스트 시작하기
                </button>

                <p className="text-xs text-gray-400 mt-4 text-center">
                    약 3분 · 20개 질문
                </p>
            </div>
        </div>
    );
}
