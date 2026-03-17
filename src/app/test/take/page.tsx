"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions, miniFacts } from "@/data/climateQuestions";
import { factDetails } from "@/data/factDetails";
import { TestAnswer, MiniFact } from "@/types/climateTest";
import { generateSessionId, getUTMParams, calculateMBTIType } from "@/lib/climateTest";

const renderBoldText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

function TestTakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [showMiniFact, setShowMiniFact] = useState<MiniFact | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setTimeout(() => setIsReady(true), 100);
  }, []);

  const handleAnswer = (answer: TestAnswer["answer"]) => {
    if (!currentQuestion) return;

    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    const answeredQuestionNumber = currentQuestionIndex + 1;

    if (currentQuestionIndex === questions.length - 1) {
      saveTestResult(newAnswers);
      return;
    }

    const factMapping: Record<number, number> = {
      5: 0,
      10: 1,
      12: 2,
      15: 3,
    };

    if (factMapping[answeredQuestionNumber] !== undefined) {
      const factIndex = factMapping[answeredQuestionNumber];
      setShowMiniFact(miniFacts[factIndex]);
    } else {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  const saveTestResult = (finalAnswers: TestAnswer[]) => {
    try {
      const resultType = calculateMBTIType(finalAnswers);
      const fromDeclare = searchParams.get("from") === "declare";
      const declaredParam = fromDeclare ? "&declared=true" : "&declared=false";
      router.push(`/test/result?session=${sessionId}&type=${resultType}${declaredParam}`);

      const utmParams = getUTMParams();
      fetch("/api/climate-test/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, answers: finalAnswers, resultType, ...utmParams }),
      }).catch((e) => console.warn("Failed to save:", e));
    } catch (error) {
      console.error("Error calculating test result:", error);
      const fromDeclare = searchParams.get("from") === "declare";
      const declaredParam = fromDeclare ? "&declared=true" : "&declared=false";
      router.push(`/test/result?session=${sessionId}&type=ENFP${declaredParam}`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleCloseMiniFact = () => {
    setShowMiniFact(null);
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  // Mini fact
  if (showMiniFact) {
    const factDetail = factDetails.find(f => f.id === showMiniFact.id);

    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-lg">
          <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-6 leading-tight">
            {showMiniFact.title}
          </h2>

          <div className="rounded-xl bg-gray-50 border border-gray-100 p-5 mb-8">
            <p className="text-[15px] text-gray-700 leading-relaxed">
              {renderBoldText(showMiniFact.content)}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full h-12 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors"
            >
              자세히 알아보기
            </button>

            <button
              onClick={handleCloseMiniFact}
              className="w-full h-13 bg-green-700 hover:bg-green-800 active:bg-green-900 text-white text-[15px] font-semibold rounded-xl transition-colors"
            >
              다음 질문으로
            </button>
          </div>
        </div>

        {/* Detail modal */}
        {isModalOpen && factDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
              <div className="sticky top-0 z-10 bg-white border-b border-gray-100 p-5 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{factDetail.pageTitle}</h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-6">
                {factDetail.sections.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">{section.title}</h4>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {section.content}
                    </div>
                  </div>
                ))}

                <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
                  <h4 className="font-bold mb-2">출처</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {factDetail.sources.map((source, idx) => (
                      <li key={idx}>{source}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-100 p-5">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full h-12 bg-gray-900 text-white text-sm font-semibold rounded-xl"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Loading
  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
          <p className="text-sm text-gray-400">테스트를 준비하는 중...</p>
        </div>
      </div>
    );
  }

  // No question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="text-center space-y-4">
          <p className="text-sm text-red-500">질문을 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push("/test")}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // Question
  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-5 pt-20 pb-16">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 leading-snug mb-2">
            {currentQuestion.question}
          </h2>
          {currentQuestion.id === 16 && (
            <p className="text-sm text-gray-400 italic">
              *제로웨이스트: 쓰레기를 만들지 않는 생활방식
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleAnswer(currentQuestion.optionA.value)}
            className="w-full p-5 text-left border border-gray-200 hover:border-green-500 hover:bg-green-50/50 active:bg-green-50 rounded-xl transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-gray-500">A</span>
              </div>
              <span className="text-[15px] text-gray-800 leading-relaxed">
                {currentQuestion.optionA.text}
              </span>
            </div>
          </button>

          <button
            onClick={() => handleAnswer(currentQuestion.optionB.value)}
            className="w-full p-5 text-left border border-gray-200 hover:border-green-500 hover:bg-green-50/50 active:bg-green-50 rounded-xl transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center mt-0.5">
                <span className="text-sm font-semibold text-gray-500">B</span>
              </div>
              <span className="text-[15px] text-gray-800 leading-relaxed">
                {currentQuestion.optionB.text}
              </span>
            </div>
          </button>
        </div>

        {/* Previous */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="w-full text-sm text-gray-400 hover:text-gray-900 transition-colors"
          >
            ← 이전 질문
          </button>
        )}
      </div>
    </div>
  );
}

export default function TestTakePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
          <p className="text-sm text-gray-400">테스트를 준비하는 중...</p>
        </div>
      </div>
    }>
      <TestTakeContent />
    </Suspense>
  );
}
