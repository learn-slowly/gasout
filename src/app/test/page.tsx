"use client";

import { useRouter } from "next/navigation";

export default function TestStartPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
            <div className="w-full max-w-lg text-center">

                <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
                    지금, 기후시민으로서<br />행동할 수 있습니다
                </h1>

                <p className="text-[15px] text-gray-500 leading-relaxed mb-10">
                    경남기후위기비상행동과 함께<br />
                    기후시민 선언에 참여하고,<br />
                    나만의 기후행동 스타일을 알아보세요.
                </p>

                <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-10 text-left">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        기후시민 성향 테스트
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        20개 질문으로 나에게 맞는 기후행동 방법을 찾아보세요.
                    </p>
                </div>

                <button
                    onClick={() => router.push("/test/take")}
                    className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors"
                >
                    테스트 시작하기
                </button>

                <p className="text-xs text-gray-400 mt-4">
                    약 3분 소요
                </p>
            </div>
        </div>
    );
}
