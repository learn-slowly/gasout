"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { questions, miniFacts } from "@/data/climateQuestions";
import { factDetails } from "@/data/factDetails";
import { TestAnswer, MiniFact } from "@/types/climateTest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { generateSessionId, getUTMParams, calculateMBTIType } from "@/lib/climateTest";

// **텍스트**를 볼드로 변환하는 함수
const renderBoldText = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-amber-800">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

export default function TestTakePage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<TestAnswer[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [showMiniFact, setShowMiniFact] = useState<MiniFact | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [isReady, setIsReady] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    // 세션 ID 생성 및 준비 완료
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);

    // 즉시 준비 완료로 설정
    setTimeout(() => {
      setIsReady(true);
    }, 100);
  }, []);

  const handleAnswer = (answer: TestAnswer["answer"]) => {
    if (!currentQuestion) return;

    const newAnswer: TestAnswer = {
      questionId: currentQuestion.id,
      answer,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    // 답변한 질문 번호 (1부터 시작)
    const answeredQuestionNumber = currentQuestionIndex + 1;
    const nextQuestionNumber = answeredQuestionNumber + 1;

    console.log(`${answeredQuestionNumber}번째 질문에 답변함`);

    // 마지막 질문(20번)이면 결과 페이지로
    if (currentQuestionIndex === questions.length - 1) {
      console.log("마지막 질문! 결과 페이지로 이동");
      saveTestResult(newAnswers);
      return;
    }

    // 미니 팩트 표시 위치 (재정렬된 20문항 기준)
    // E/I(1-5) → S/N(6-10) → T/F(11-15) → J/P(16-20)
    // Q6 앞 (Q5 후, E/I→S/N 전환) = miniFact 1 (LNG가 화석연료)
    // Q11 앞 (Q10 후, S/N→T/F 전환) = miniFact 2 (좌초자산)
    // Q13 앞 (Q12 후) = miniFact 3 (재생에너지가 더 저렴)
    // Q16 앞 (Q15 후, T/F→J/P 전환) = miniFact 4 (탄소중립 목표와 모순)
    const factMapping: Record<number, number> = {
      5: 0,   // Q5 후 (E/I 끝) → miniFact[0]
      10: 1,  // Q10 후 (S/N 끝) → miniFact[1]
      12: 2,  // Q12 후 → miniFact[2]
      15: 3,  // Q15 후 (T/F 끝) → miniFact[3]
    };

    if (factMapping[answeredQuestionNumber] !== undefined) {
      const factIndex = factMapping[answeredQuestionNumber];
      console.log(`미니 팩트 ${factIndex + 1} 표시 (${nextQuestionNumber}번 질문 앞)`);
      setShowMiniFact(miniFacts[factIndex]);
    } else {
      // 미니 팩트가 없으면 바로 다음 질문으로
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    }
  };

  const saveTestResult = (finalAnswers: TestAnswer[]) => {
    try {
      // 클라이언트에서 결과 계산
      const resultType = calculateMBTIType(finalAnswers);

      console.log("테스트 완료! 결과 타입:", resultType);
      console.log("세션 ID:", sessionId);

      // 결과 페이지로 바로 이동 (새 경로)
      router.push(`/test/result?session=${sessionId}&type=${resultType}`);

      // 백그라운드에서 DB 저장 시도 (실패해도 무시)
      const utmParams = getUTMParams();
      fetch("/api/climate-test/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          answers: finalAnswers,
          resultType,
          ...utmParams,
        }),
      }).catch((saveError) => {
        console.warn("Failed to save to database (non-critical):", saveError);
      });
    } catch (error) {
      console.error("Error calculating test result:", error);
      // 에러가 있어도 결과 페이지로 이동 (임시로 ENFP)
      router.push(`/test/result?session=${sessionId}&type=ENFP`);
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
    // 다음 질문으로 이동
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleStartTest = () => {
    setShowIntro(false);
  };

  // 인트로 화면
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-24 sm:pt-28 p-4 pb-safe overflow-x-hidden w-full max-w-full">
        <div className="w-full max-w-2xl overflow-hidden space-y-5 sm:space-y-6">
          {/* 헤더 */}
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-words">
              💡 왜 지금 &apos;기후시민 선언&apos;이 필요할까?
            </h1>
          </div>

          <Card className="w-full border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 w-full overflow-hidden space-y-5 sm:space-y-6">
              {/* 내용 */}
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5 sm:p-6 text-left w-full overflow-hidden">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words w-full mb-3">
                  기후위기는 더 이상 먼 미래의 문제가 아니야. 우리의 건강·경제·지역의 지속가능성을 좌우하는 현실적인 과제이지!
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words w-full mb-3">
                  석탄을 LNG로 바꾸는 것은 나쁜 것을 다른 나쁜 것으로 바꾸는 거야.
                </p>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words w-full">
                  우리가 바라는 에너지 전환은 모두가 참여하는 정의로운 방식으로 친환경 재생에너지 중심의 체계로 이동하는 거야!
                  그 중심에 <strong className="text-green-700">정의로운 에너지 전환</strong>이 있어.
                </p>
              </div>

              {/* 우리에게 필요한 것 */}
              <div className="bg-blue-50 rounded-xl p-5 sm:p-6 text-left w-full overflow-hidden">
                <h3 className="font-bold text-gray-900 mb-3 text-base sm:text-lg break-words">
                  🌱 우리에게 필요한 건?
                </h3>
                <p className="text-lg sm:text-xl font-bold text-green-700 break-words w-full">
                  분산형·친환경 재생에너지 중심의 미래
                </p>
              </div>

              {/* 시작 버튼 */}
              <Button
                onClick={handleStartTest}
                className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold min-h-[56px] text-base sm:text-lg rounded-xl touch-manipulation"
                size="lg"
              >
                테스트 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (showMiniFact) {
    const factDetail = factDetails.find(f => f.id === showMiniFact.id);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 p-4 sm:p-5 flex justify-between items-center">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">{showMiniFact.title}</span>
            </h2>
            <Button
              onClick={handleCloseMiniFact}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full h-10 w-10"
            >
              ✕
            </Button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-5">
              <p className="text-gray-800 leading-relaxed text-lg font-medium">
                {renderBoldText(showMiniFact.content)}
              </p>
            </div>

            {factDetail && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 delay-150">
                <div className="flex items-center gap-3 py-2">
                  <span className="text-4xl">{factDetail.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{factDetail.pageTitle}</h3>
                    <p className="text-gray-600">{factDetail.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {factDetail.sections.slice(0, 3).map((section, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-bold text-lg text-gray-800">{section.title}</h4>
                      <div className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {section.content}
                      </div>
                    </div>
                  ))}

                  {/* 내용이 더 있으면 표시 */}
                  {factDetail.sections.length > 3 && (
                    <p className="text-center text-gray-500 text-sm italic">
                      ... 더 많은 내용은 '더 알아보기' 페이지에서 확인할 수 있어요 ...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 sm:p-5">
            <Button
              onClick={handleCloseMiniFact}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-lg h-14 rounded-xl shadow-lg shadow-green-200"
            >
              확인했어요, 다음으로! 👉
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 준비 중이면 로딩 표시
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-20 sm:pt-24 p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mx-auto"></div>
          <p className="text-gray-600 text-sm">테스트를 준비하는 중...</p>
        </div>
      </div>
    );
  }

  // 질문이 없으면 에러
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-20 sm:pt-24 p-4">
        <div className="text-center space-y-4">
          <p className="text-red-600">질문을 불러올 수 없습니다.</p>
          <Button onClick={() => router.push("/test")}>
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 flex items-start justify-center pt-20 sm:pt-24 p-4 pb-safe overflow-x-hidden w-full max-w-full">
      <div className="w-full max-w-2xl overflow-hidden">
        <Card className="w-full border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-6 w-full overflow-hidden">
            {/* 진행률 바 */}
            <div className="mb-5 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {currentQuestionIndex + 1} / {questions.length}
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-600">
                  {/* 차원 표시 삭제 */}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 sm:h-3">
                <div
                  className="bg-green-600 h-2.5 sm:h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* 질문 */}
            <div className="space-y-5 sm:space-y-6 mb-6 sm:mb-8 w-full overflow-hidden">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 text-center leading-tight px-2 break-words w-full">
                  {currentQuestion.question}
                </h2>
                {/* 질문 16번에 제로웨이스트 설명 추가 */}
                {currentQuestion.id === 16 && (
                  <p className="text-sm sm:text-base text-gray-600 text-center italic px-2">
                    *제로웨이스트: 쓰레기를 만들지 않는 생활방식
                  </p>
                )}
              </div>

              {/* 선택지 */}
              <div className="space-y-3 sm:space-y-4 w-full">
                <Button
                  onClick={() => handleAnswer(currentQuestion.optionA.value)}
                  variant="outline"
                  className="w-full p-5 sm:p-6 h-auto text-left justify-start border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 active:border-green-700 active:bg-green-100 transition-all touch-manipulation min-h-[72px] sm:min-h-[80px] rounded-xl overflow-hidden !whitespace-normal"
                >
                  <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center mt-0.5">
                      <span className="text-sm sm:text-base font-bold text-gray-700 whitespace-nowrap">A</span>
                    </div>
                    <span className="text-base sm:text-lg text-gray-900 leading-relaxed flex-1 break-words min-w-0 whitespace-normal">
                      {currentQuestion.optionA.text}
                    </span>
                  </div>
                </Button>

                <Button
                  onClick={() => handleAnswer(currentQuestion.optionB.value)}
                  variant="outline"
                  className="w-full p-5 sm:p-6 h-auto text-left justify-start border-2 border-gray-300 hover:border-green-600 hover:bg-green-50 active:border-green-700 active:bg-green-100 transition-all touch-manipulation min-h-[72px] sm:min-h-[80px] rounded-xl overflow-hidden !whitespace-normal"
                >
                  <div className="flex items-start gap-3 sm:gap-4 w-full min-w-0">
                    <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center mt-0.5">
                      <span className="text-sm sm:text-base font-bold text-gray-700 whitespace-nowrap">B</span>
                    </div>
                    <span className="text-base sm:text-lg text-gray-900 leading-relaxed flex-1 break-words min-w-0 whitespace-normal">
                      {currentQuestion.optionB.text}
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            {/* 이전 버튼 */}
            {currentQuestionIndex > 0 && (
              <Button
                onClick={handlePrevious}
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900 active:text-gray-900 min-h-[44px] touch-manipulation"
              >
                ← 이전 질문
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

