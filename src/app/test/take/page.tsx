"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { questions } from "@/data/climateQuestions";
import { TestAnswer } from "@/types/climateTest";
import { generateSessionId, getUTMParams, calculateClimateType } from "@/lib/climateTest";
import { motion, AnimatePresence } from "framer-motion";

function TestTakeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [selected, setSelected] = useState<'A' | 'B' | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    setSessionId(generateSessionId());
    setTimeout(() => setIsReady(true), 100);
  }, []);

  const handleAnswer = (answer: TestAnswer["answer"], option: 'A' | 'B') => {
    if (!currentQuestion || selected) return;

    setSelected(option);

    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // 짧은 딜레이 후 다음 질문 또는 결과
    setTimeout(() => {
      if (currentQuestionIndex === questions.length - 1) {
        saveTestResult(newAnswers);
      } else {
        setSelected(null);
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }, 500);
  };

  const saveTestResult = (finalAnswers: TestAnswer[]) => {
    try {
      const resultType = calculateClimateType(finalAnswers);
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
      router.push(`/test/result?session=${sessionId}&type=earth-healer`);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setSelected(null);
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-200 border-t-gray-600 mx-auto"></div>
          <p className="text-sm text-gray-400">준비 중...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-white flex items-start justify-center px-5 pt-20 pb-16">
      <div className="w-full max-w-lg">

        {/* Progress */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-gray-400">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-green-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                {currentQuestion.question}
              </h2>
            </div>

            {/* Options - 밸런스게임 스타일 */}
            <div className="space-y-3">
              <button
                onClick={() => handleAnswer(currentQuestion.optionA.value, 'A')}
                disabled={selected !== null}
                className={`w-full p-6 text-left border-2 rounded-2xl transition-all duration-300 ${
                  selected === 'A'
                    ? 'border-green-500 bg-green-50 scale-[1.02]'
                    : selected === 'B'
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : 'border-gray-200 hover:border-green-400 hover:bg-green-50/30 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300 ${
                    selected === 'A'
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-300 text-gray-400'
                  }`}>
                    <span className="text-sm font-bold">A</span>
                  </div>
                  <span className="text-[15px] text-gray-800 leading-relaxed font-medium">
                    {currentQuestion.optionA.text}
                  </span>
                </div>
              </button>

              <div className="flex items-center justify-center py-3">
                <span className="text-4xl text-gray-300 tracking-[0.15em]" style={{ fontWeight: 900 }}>VS</span>
              </div>

              <button
                onClick={() => handleAnswer(currentQuestion.optionB.value, 'B')}
                disabled={selected !== null}
                className={`w-full p-6 text-left border-2 rounded-2xl transition-all duration-300 ${
                  selected === 'B'
                    ? 'border-green-500 bg-green-50 scale-[1.02]'
                    : selected === 'A'
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : 'border-gray-200 hover:border-green-400 hover:bg-green-50/30 active:scale-[0.98]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 transition-colors duration-300 ${
                    selected === 'B'
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-300 text-gray-400'
                  }`}>
                    <span className="text-sm font-bold">B</span>
                  </div>
                  <span className="text-[15px] text-gray-800 leading-relaxed font-medium">
                    {currentQuestion.optionB.text}
                  </span>
                </div>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Previous */}
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="w-full text-sm text-gray-400 hover:text-gray-900 transition-colors mt-8"
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
          <p className="text-sm text-gray-400">준비 중...</p>
        </div>
      </div>
    }>
      <TestTakeContent />
    </Suspense>
  );
}
