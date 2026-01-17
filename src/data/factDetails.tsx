
import { FactDetail } from "@/types/climateTest";

export const factDetails: FactDetail[] = [
    {
        id: 1,
        emoji: "🤔",
        pageTitle: "LNG, 정말 '깨끗한' 에너지일까요?",
        subtitle: "LNG는 화석연료입니다",
        sections: [
            {
                title: "1. LNG란 무엇인가요?",
                content: (
                    <div className="space-y-4">
                        <p>
                            LNG(Liquefied Natural Gas, 액화천연가스)는 <strong>천연가스를 영하 162도로 냉각</strong>해서 액체로 만든 거예요.
                            천연가스의 주성분은 <strong>메탄(CH₄)</strong>이고요.
                        </p>
                        <p>
                            &quot;천연&quot;이라는 단어 때문에 친환경처럼 들리지만, <strong className="text-red-600">석탄, 석유와 똑같은 화석연료</strong>예요.
                        </p>
                    </div>
                ),
            },
            {
                title: "2. 왜 '깨끗하다'는 오해가 생겼을까요?",
                content: (
                    <div className="space-y-4">
                        <p>LNG는 석탄보다 탄소 배출이 적어요.</p>
                        <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span>석탄:</span>
                                <span className="font-bold">CO₂ 배출량 100</span>
                            </div>
                            <div className="flex justify-between">
                                <span>LNG:</span>
                                <span className="font-bold">CO₂ 배출량 약 50~60</span>
                            </div>
                        </div>
                        <p>
                            그래서 &quot;석탄보다 깨끗하니까 괜찮다&quot;는 논리가 나왔어요.
                            하지만 <strong>50~60도 여전히 많은 양</strong>이고, <strong className="text-green-600">재생에너지는 거의 0</strong>이에요.
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <p className="font-medium">
                                💡 <strong>비유하자면:</strong> 담배 2갑 피우던 사람이 1갑으로 줄였다고 &quot;건강해졌다&quot;고 말하는 것과 같아요.
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                title: "3. 메탄 누출의 심각성",
                content: (
                    <div className="space-y-4">
                        <p>LNG의 가장 큰 문제는 <strong className="text-red-600">메탄 누출</strong>이에요.</p>

                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">📊 메탄의 온실효과</h4>
                            <ul className="space-y-1">
                                <li>• CO₂보다 <strong>20년 기준 80배</strong> 강력</li>
                                <li>• <strong>100년 기준으로도 28배</strong> 강력</li>
                            </ul>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🔍 어디서 누출되나요?</h4>
                            <ol className="space-y-1 list-decimal list-inside">
                                <li><strong>채굴 과정:</strong> 땅에서 가스를 뽑을 때</li>
                                <li><strong>운송 과정:</strong> 파이프라인이나 LNG 선박</li>
                                <li><strong>저장/재기화:</strong> 액체를 다시 기체로 만들 때</li>
                            </ol>
                        </div>

                        <p>
                            최근 연구에 따르면 전체 과정에서 <strong>2.5~3.7%</strong>의 메탄이 누출돼요.
                            이렇게 되면 LNG는 석탄보다 <strong className="text-red-600">오히려 더 나쁠 수도</strong> 있어요!
                        </p>
                    </div>
                ),
            },
            {
                title: "4. 실제 사례",
                content: (
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇺🇸 미국 텍사스 퍼미안 분지</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 세계 최대 LNG 생산지 중 하나</li>
                                <li>• 위성으로 관측한 결과, 공식 통계보다 <strong>2배 많은 메탄</strong> 누출</li>
                                <li>• 2019년 한 해에만 약 <strong>260만 톤의 메탄</strong> 유출</li>
                            </ul>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇦🇺 호주 고르곤 프로젝트</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 세계 최대 LNG 프로젝트 중 하나</li>
                                <li>• 탄소 포집 시설이 있지만 <strong>계획의 절반도 못 잡아냄</strong></li>
                                <li>• 주민들의 건강 피해 보고 증가</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "5. 국제사회의 평가",
                content: (
                    <div className="space-y-4">
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🌍 유엔 IPCC 보고서 (2023)</h4>
                            <blockquote className="italic border-l-4 border-green-500 pl-4">
                                &quot;LNG는 전환기 연료가 아니다. 2050 탄소중립 목표 달성을 위해서는 화석연료 사용을 빠르게 줄여야 한다.&quot;
                            </blockquote>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇪🇺 EU 택소노미 (녹색 분류 체계)</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 2022년 LNG를 &quot;일시적 녹색에너지&quot;로 분류해 논란</li>
                                <li>• 유럽 의회에서 <strong>강력한 반대</strong> 의견</li>
                                <li>• &quot;그린워싱(위장 환경주의)&quot;이라는 비판</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "6. 그렇다면 어떻게 해야 할까요?",
                content: (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <span className="text-green-600 text-xl">✅</span>
                                <div>
                                    <h4 className="font-bold">직접 재생에너지로 전환</h4>
                                    <p className="text-sm text-gray-600">LNG를 &quot;징검다리&quot;로 거치면 시간과 비용 낭비. 바로 태양광, 풍력, 수소로 가는 게 효율적</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-600 text-xl">✅</span>
                                <div>
                                    <h4 className="font-bold">메탄 감시 강화</h4>
                                    <p className="text-sm text-gray-600">국제 메탄 배출 관측소(IMEO) 같은 감시 체계. 한국도 투명한 측정과 공개 필요</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-green-600 text-xl">✅</span>
                                <div>
                                    <h4 className="font-bold">기존 LNG 발전소 조기 폐쇄 계획</h4>
                                    <p className="text-sm text-gray-600">새로 짓지 말고, 있는 것도 줄여나가기</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
        ],
        sources: [
            "IPCC 6차 평가보고서 (2023)",
            "국제에너지기구(IEA), \"World Energy Outlook 2024\"",
            "환경재단, \"LNG의 진실\" 리포트 (2023)",
            "기후솔루션, \"LNG 메탄 누출의 기후 영향\" (2024)",
            "Science 저널, \"Methane emissions from natural gas systems\" (2024)",
        ],
        closingMessage: "LNG가 화석연료인 줄 몰랐어요. 정부 발표만 들으면 친환경인 줄 알았는데... 이런 오해는 당연해요. 의도적으로 만들어진 프레임이니까요. 중요한 건 이제 알았다는 거, 그리고 목소리를 낼 수 있다는 거예요.",
    },
    {
        id: 2,
        emoji: "💸",
        pageTitle: "LNG 발전소, 세금 먹는 하마가 될 수 있어요",
        subtitle: "좌초자산이 될 위험",
        sections: [
            {
                title: "1. '좌초자산'이란?",
                content: (
                    <div className="space-y-4">
                        <p>
                            <strong>좌초자산(Stranded Asset)</strong>은 예상보다 훨씬 빨리 가치가 사라져서
                            <strong className="text-red-600"> 쓸모없이 방치되는 자산</strong>을 말해요.
                        </p>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <p className="font-medium">
                                🚢 <strong>비유하자면:</strong> 증기선이 한창일 때 거액을 들여 증기선 공장을 지었는데,
                                10년도 안 돼서 디젤선박이 나와버린 격이죠.
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                title: "2. 왜 LNG 발전소가 좌초자산이 될까요?",
                content: (
                    <div className="space-y-4">
                        <h4 className="font-bold">⏰ 수명의 역설</h4>
                        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2 font-medium">LNG 발전소 평균 수명</td>
                                        <td className="py-2 text-right font-bold">30~40년</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2 font-medium">2025년 신규 건설 시</td>
                                        <td className="py-2 text-right font-bold">2055~2065년까지 가동</td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 font-medium">한국 탄소중립 목표</td>
                                        <td className="py-2 text-right font-bold text-red-600">2050년</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="bg-red-50 rounded-lg p-4">
                            <p className="font-medium text-red-800">
                                ❓ <strong>이상하죠?</strong> 2050년부터는 화석연료를 쓸 수 없는데,
                                2055년까지 써야 하는 발전소를 지금 짓는다고요?
                            </p>
                        </div>
                    </div>
                ),
            },
            {
                title: "3. 실제로 일어나고 있어요",
                content: (
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇺🇸 미국 사례</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 2010년대 초반 &quot;셰일가스 혁명&quot;으로 LNG 발전소 대량 건설</li>
                                <li>• 10년도 안 돼서 재생에너지에 밀림</li>
                                <li>• <strong>40개 이상의 LNG 발전소 조기 폐쇄</strong></li>
                                <li>• 투자자들 <strong className="text-red-600">수조 원 손실</strong></li>
                            </ul>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇦🇺 호주 사례</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 고르곤 LNG 프로젝트: <strong>60조 원</strong> 투자</li>
                                <li>• 탄소포집 실패 + 가스 가격 급등</li>
                                <li>• 예상 수익의 절반도 못 거둠</li>
                                <li>• <strong className="text-red-600">&quot;21세기 최악의 에너지 투자&quot;</strong> 평가</li>
                            </ul>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇪🇺 유럽 사례</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 독일, 네덜란드 등 LNG 터미널 건설</li>
                                <li>• 러-우 전쟁으로 긴급 가동</li>
                                <li>• 하지만 <strong>2030년 이후 사용 계획 없음</strong></li>
                                <li>• 이미 &quot;10년도 못 쓸 시설&quot;로 인정</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "4. 경남 LNG 발전소, 얼마나 위험할까요?",
                content: (
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-bold mb-2">💰 예상 건설비</h4>
                            <ul className="space-y-1">
                                <li>• 1기당 약 <strong>1조 원</strong></li>
                                <li>• 경남 삼천포 등 계획: <strong>2~3기</strong></li>
                                <li>• 총 <strong className="text-red-600">2~3조 원</strong></li>
                            </ul>
                        </div>

                        <h4 className="font-bold">📉 손실 시나리오</h4>
                        <div className="space-y-3">
                            <div className="bg-yellow-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">시나리오 A: 2040년 조기 폐쇄</h5>
                                <p className="text-sm">회수 못 한 투자비: <strong className="text-red-600">1.5조 원</strong></p>
                            </div>
                            <div className="bg-orange-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">시나리오 B: 2050년 강제 폐쇄</h5>
                                <p className="text-sm">회수 못 한 투자비: <strong className="text-red-600">1조 원</strong></p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">시나리오 C: 계속 운영 (최악)</h5>
                                <p className="text-sm">국민 부담 <strong className="text-red-600">연 5,000억 원 이상</strong></p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "5. 이미 경고받고 있어요",
                content: (
                    <div className="space-y-4">
                        <h4 className="font-bold">🏦 국제 금융기관들의 탈출</h4>
                        <div className="space-y-3">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <h5 className="font-bold text-sm">블랙록(BlackRock)</h5>
                                <p className="text-sm">세계 최대 자산운용사. 2020년부터 화석연료 투자 <strong>대폭 축소</strong>. &quot;기후위험 = 투자위험&quot;</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <h5 className="font-bold text-sm">세계은행(World Bank)</h5>
                                <p className="text-sm">2019년부터 석유·가스 프로젝트 <strong>대출 중단</strong>. LNG도 포함</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">한국 연기금들도 움직임</h5>
                                <p className="text-sm">국민연금: 석탄 투자 <strong>철회</strong> 선언. 하지만 LNG는 아직 투자 중... 😰</p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "6. 누가 손해를 보나요?",
                content: (
                    <div className="space-y-4">
                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-bold mb-3">😰 결국 국민이 부담해요</h4>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <span className="bg-red-200 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                    <div>
                                        <h5 className="font-bold text-sm">전기요금 인상</h5>
                                        <p className="text-sm text-gray-600">손실은 전력공사 적자로 → 적자는 전기요금 인상으로</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="bg-red-200 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                    <div>
                                        <h5 className="font-bold text-sm">세금 투입</h5>
                                        <p className="text-sm text-gray-600">발전공기업 손실 메우기 + 정리 비용까지 세금으로</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="bg-red-200 text-red-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                    <div>
                                        <h5 className="font-bold text-sm">지역 경제 타격</h5>
                                        <p className="text-sm text-gray-600">건설 일자리는 일시적, 폐쇄되면 지역경제 붕괴</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "7. 다른 나라는 어떻게 하고 있나요?",
                content: (
                    <div className="space-y-4">
                        <div className="grid gap-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇩🇰 덴마크</h5>
                                <p className="text-sm">마지막 석탄 발전소 <strong>2030년 폐쇄</strong> 결정. 10년 일찍 닫아도 장기적으로 이득</p>
                            </div>
                            <div className="bg-green-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇬🇧 영국</h5>
                                <p className="text-sm">2024년 마지막 석탄 발전소 폐쇄. LNG는 <strong>2035년까지 단계적 감축</strong></p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇨🇦 캐나다</h5>
                                <p className="text-sm">온타리오주: <strong>2014년 석탄 발전 완전 중단</strong>. 북미 최초 탈석탄 달성</p>
                            </div>
                        </div>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <p className="font-medium">💡 <strong>공통점:</strong> &quot;손해 보더라도 빨리 끊는 게 낫다&quot;</p>
                        </div>
                    </div>
                ),
            },
            {
                title: "8. 과거의 실수를 반복하지 말아야 해요",
                content: (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm">🏭 <strong>4대강 사업:</strong> 22조 원 → 쓸모없는 보</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm">🚄 <strong>경전선 복선전철:</strong> 2조 원 → 적자 노선</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm">🏗️ <strong>새만금:</strong> 40년째 미완성</p>
                            </div>
                        </div>
                        <p className="font-bold text-center text-lg">
                            이제는 <span className="text-green-600">20년 후를 보고 결정</span>해야 해요.
                        </p>
                    </div>
                ),
            },
        ],
        sources: [
            "Carbon Tracker Initiative, \"Stranded Assets and Fossil Fuels\" (2024)",
            "국제에너지기구(IEA), \"World Energy Outlook 2024\"",
            "에너지경제연구원, \"LNG 발전소 경제성 분석\" (2024)",
            "기후솔루션, \"좌초자산 위험 보고서\" (2024)",
            "한국은행, \"에너지 전환과 좌초자산 리스크\" (2023)",
        ],
        closingMessage: "10년 뒤 우리 아이들이 물어볼 거예요. '왜 그때 알면서도 지었어요?' 답할 수 있나요?",
    },
    {
        id: 3,
        emoji: "💰",
        pageTitle: "재생에너지, 이제는 더 싸고 더 똑똑한 선택이에요",
        subtitle: "재생에너지가 더 저렴합니다",
        sections: [
            {
                title: "1. 전 세계적으로 태양광이 가장 저렴한 에너지원이 됐어요",
                content: (
                    <div className="space-y-4">
                        <p>
                            <strong className="text-green-600">전 세계적으로 태양광은 이미 가장 저렴한 에너지원</strong>이 되었어요.
                            &quot;재생에너지는 비싸다&quot;는 말은 이제 과거의 이야기예요.
                        </p>

                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🌍 글로벌 트렌드</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 전 세계 신규 발전소의 <strong>80% 이상</strong>이 재생에너지</li>
                                <li>• 태양광 발전 비용: 10년 전 대비 <strong>89% 하락</strong></li>
                                <li>• 풍력 발전 비용: 10년 전 대비 <strong>70% 하락</strong></li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🇰🇷 한국의 &apos;그리드 패리티&apos;</h4>
                            <p className="text-sm mb-2">
                                <strong>그리드 패리티(Grid Parity)</strong>란 재생에너지 발전 비용이 기존 화석연료와 같아지는 시점을 말해요.
                            </p>
                            <ul className="space-y-1 text-sm">
                                <li>• 재생에너지 단가: <strong className="text-green-600">계속 하락 중</strong> ⬇️</li>
                                <li>• LNG 비용(탄소세 포함): <strong className="text-red-600">계속 상승 중</strong> ⬆️</li>
                                <li>• 한국도 장기적으로 <strong>그리드 패리티에 도달</strong>할 것</li>
                            </ul>
                        </div>

                        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                            <h4 className="font-bold mb-2 text-sm">📊 비용 추세 비교</h4>
                            <div className="flex items-center justify-center gap-8 py-4">
                                <div className="text-center">
                                    <div className="text-3xl mb-2">☀️</div>
                                    <div className="font-bold text-green-600">재생에너지</div>
                                    <div className="text-2xl">⬇️</div>
                                    <div className="text-sm text-gray-600">계속 하락</div>
                                </div>
                                <div className="text-4xl text-gray-400">⟷</div>
                                <div className="text-center">
                                    <div className="text-3xl mb-2">🔥</div>
                                    <div className="font-bold text-red-600">LNG + 탄소세</div>
                                    <div className="text-2xl">⬆️</div>
                                    <div className="text-sm text-gray-600">계속 상승</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                            <p className="font-medium">🎯 <strong>핵심:</strong> 전 세계적으로 태양광이 가장 저렴한 에너지원이 됐고, 한국도 그리드 패리티에 도달하는 건 시간문제예요!</p>
                        </div>
                    </div>
                ),
            },
            {
                title: "2. 왜 이렇게 싸졌을까요?",
                content: (
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🔧 기술 발전</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 태양광 패널 효율: 15% → <strong>22% 이상</strong></li>
                                <li>• 패널 가격: 10년 전의 <strong>1/10 수준</strong></li>
                                <li>• 풍력 터빈: 더 크고, 더 효율적으로</li>
                            </ul>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">📈 규모의 경제</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 전 세계 생산량 급증</li>
                                <li>• 중국, 유럽 대량 생산으로 가격 하락</li>
                                <li>• 한국도 뒤늦게 참여 중</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🔬 연구개발 투자</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 전 세계 R&D 투자 <strong>연간 500조 원</strong> 규모</li>
                                <li>• 배터리, 그리드 기술도 빠르게 발전</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "3. 화석연료는 점점 비싸져요",
                content: (
                    <div className="space-y-4">
                        <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">⛽ LNG 가격의 문제</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 국제 가스 가격에 <strong>전적으로 의존</strong></li>
                                <li>• 러시아-우크라이나 전쟁으로 가격 <strong className="text-red-600">3배 폭등</strong> (2022)</li>
                                <li>• 중동 정세 불안 → 언제든 또 오를 수 있음</li>
                            </ul>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">💸 숨겨진 비용</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 대기오염 치료 비용</li>
                                <li>• 기후재난 피해 복구 비용</li>
                                <li>• 이런 걸 다 합치면 <strong>실제 비용은 2~3배</strong></li>
                            </ul>
                        </div>

                        <div className="bg-yellow-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">🌍 탄소 가격제</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• EU는 이미 탄소국경세 시행 중</li>
                                <li>• 한국도 조만간 탄소배출권 가격 <strong>급등</strong> 예상</li>
                                <li>• LNG 쓸수록 비용 부담 ⬆️</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "4. 세계는 이미 움직이고 있어요",
                content: (
                    <div className="space-y-4">
                        <div className="grid gap-3">
                            <div className="bg-blue-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇪🇺 유럽연합</h5>
                                <p className="text-sm">2030년까지 재생에너지 비율 <strong>42.5%</strong>. 2024년 재생에너지 투자: <strong>약 380조 원</strong></p>
                            </div>
                            <div className="bg-red-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇨🇳 중국</h5>
                                <p className="text-sm">2023년 태양광 신규 설치: <strong>전 세계의 60%</strong>. 석탄 대체 속도 세계 최고</p>
                            </div>
                            <div className="bg-indigo-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇺🇸 미국</h5>
                                <p className="text-sm">IRA로 재생에너지에 <strong>4,000조 원</strong> 투자. 텍사스주: 풍력만으로 전체 전력 30% 공급</p>
                            </div>
                            <div className="bg-pink-50 rounded-lg p-3">
                                <h5 className="font-bold text-sm">🇯🇵 일본</h5>
                                <p className="text-sm">후쿠시마 이후 재생에너지 급증. 2030년 목표: 재생에너지 <strong>36~38%</strong></p>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "5. 한국은 왜 느릴까요?",
                content: (
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-bold mb-2">😰 뒤처진 한국</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 2023년 재생에너지 발전 비중: <strong className="text-red-600">9.5%</strong></li>
                                <li>• OECD 평균(30%)의 <strong>1/3 수준</strong></li>
                                <li>• 아직도 LNG, 석탄 신규 발전소 계획 중</li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">❓ 왜 이럴까요?</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 기존 발전사업자의 <strong>기득권</strong></li>
                                <li>• 전력 시스템의 경직성</li>
                                <li>• &quot;안정성&quot; 핑계로 변화 거부</li>
                                <li>• 정부의 소극적 태도</li>
                            </ul>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">💡 하지만 희망도 있어요!</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• 기업들은 이미 <strong>RE100</strong> (재생에너지 100%) 가입 중</li>
                                <li>• 지자체들의 재생에너지 사업 확대</li>
                                <li>• 시민 발전소, 에너지 협동조합 증가</li>
                            </ul>
                        </div>
                    </div>
                ),
            },
            {
                title: "6. 실제 사례: 포르투갈의 기적",
                content: (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-100 rounded-lg p-4">
                                <h4 className="font-bold mb-2 text-sm">Before (2010년)</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• 재생에너지 비중: 17%</li>
                                    <li>• 전기요금: 유럽에서 비싼 편</li>
                                    <li>• 에너지 수입 의존도 높음</li>
                                </ul>
                            </div>
                            <div className="bg-green-100 rounded-lg p-4">
                                <h4 className="font-bold mb-2 text-sm text-green-700">After (2024년)</h4>
                                <ul className="space-y-1 text-xs">
                                    <li>• 재생에너지 비중: <strong>85%</strong></li>
                                    <li>• 전기요금: <strong>30% 하락</strong></li>
                                    <li>• 에너지 독립 달성</li>
                                </ul>
                            </div>
                        </div>
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                            <p className="font-medium">🎯 <strong>교훈:</strong> &quot;비싸서 못 한다&quot;가 아니라 &quot;의지가 없어서 안 한다&quot;</p>
                        </div>
                    </div>
                ),
            },
            {
                title: "7. 비용 비교: 경남에 투자한다면?",
                content: (
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4">
                            <h4 className="font-bold mb-2">📊 건설비 비교</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• LNG 발전소 건설비: <strong>2조 원</strong></li>
                                <li>• 같은 용량의 태양광+풍력+ESS: <strong className="text-green-600">1.5~1.8조 원</strong></li>
                            </ul>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="font-bold mb-2">💡 30년 운영 비용</h4>
                            <ul className="space-y-1 text-sm">
                                <li>• LNG: 연료비 + 유지비 = 매년 3,000억 원 → 30년간 <strong className="text-red-600">9조 원</strong></li>
                                <li>• 재생에너지: 유지비만 = 매년 500억 원 → 30년간 <strong className="text-green-600">1.5조 원</strong></li>
                            </ul>
                        </div>

                        <div className="bg-green-100 rounded-lg p-4 text-center">
                            <p className="font-bold text-lg">🎉 결론</p>
                            <p>재생에너지가 <strong className="text-green-700">7.5조 원 더 싸고</strong>,</p>
                            <p>게다가 <strong className="text-green-700">탄소 배출 제로</strong>!</p>
                        </div>
                    </div>
                ),
            },
        ],
        sources: [
            "한국에너지공단, \"2024 신재생에너지백서\"",
            "국제재생에너지기구(IRENA), \"Renewable Power Generation Costs 2024\"",
            "에너지경제연구원, \"발전원별 균등화발전비용(LCOE) 분석\" (2024)",
            "BloombergNEF, \"New Energy Outlook 2024\"",
            "기후솔루션, \"한국 재생에너지 비용 분석\" (2024)",
        ],
        closingMessage: "환경을 생각해서가 아니라, 내 지갑을 생각해서라도 재생에너지를 선택해야 할 때예요. 재생에너지는 더 이상 '비싼 착한 선택'이 아니에요. 더 싸고, 더 똑똑한 선택이에요.",
    },
    {
        id: 4,
        emoji: "💎",
        pageTitle: "경남, 재생에너지의 보물창고예요",
        subtitle: "경남에는 더 좋은 대안이 있습니다",
        sections: [
            {
                title: "1. 경남의 지리적 장점",
                content: (
                    <div className="space-y-4">
                        <div className="grid gap-3">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">🌊 해안선 길이</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 남해안 <strong>1,100km</strong> 이상</li>
                                    <li>• 전국에서 <strong>가장 긴 해안선</strong></li>
                                    <li>• 섬만 <strong>400개 이상</strong></li>
                                </ul>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">☀️ 일조량</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 연간 일조시간: <strong>2,200시간 이상</strong></li>
                                    <li>• 전국 평균보다 <strong>10% 높음</strong></li>
                                    <li>• 특히 남부 해안 지역 우수</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">💨 풍속</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 남해안 평균 풍속: <strong>6~7m/s</strong></li>
                                    <li>• 해상풍력 최적 조건 (6m/s 이상)</li>
                                    <li>• 안정적인 서남풍 우세</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "2. 경남의 재생에너지 잠재력",
                content: (
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                            <h4 className="font-bold mb-2 text-sm">📊 잠재 용량 분석</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left">에너지원</th>
                                        <th className="py-2 text-right">잠재 용량</th>
                                        <th className="py-2 text-right">LNG 환산</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">해상풍력</td>
                                        <td className="py-2 text-right font-bold">20~25 GW</td>
                                        <td className="py-2 text-right">20~25기</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">태양광</td>
                                        <td className="py-2 text-right font-bold">15~18 GW</td>
                                        <td className="py-2 text-right">15~18기</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">육상풍력</td>
                                        <td className="py-2 text-right font-bold">3~5 GW</td>
                                        <td className="py-2 text-right">3~5기</td>
                                    </tr>
                                    <tr className="bg-green-50">
                                        <td className="py-2 font-bold">합계</td>
                                        <td className="py-2 text-right font-bold text-green-600">38~48 GW</td>
                                        <td className="py-2 text-right font-bold text-green-600">38~48기</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                            <p className="font-medium">💡 <strong>놀라운 사실:</strong> 경남의 재생에너지 잠재력은 현재 경남 전체 전력 소비량의 <strong>3~4배</strong>예요!</p>
                        </div>
                    </div>
                ),
            },
            {
                title: "3. 이미 진행 중인 프로젝트",
                content: (
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">1) 거제 해상풍력</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 규모: <strong>2.4 GW</strong> (세계 최대급)</li>
                                    <li>• 투자: <strong>7조 원</strong></li>
                                    <li>• 일자리: 건설 5,000명, 운영 500명</li>
                                </ul>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">2) 남해 해상풍력</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 규모: <strong>1.5 GW</strong></li>
                                    <li>• 투자: <strong>5조 원</strong></li>
                                    <li>• 어업과 공존 모델 개발 중</li>
                                </ul>
                            </div>
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h4 className="font-bold mb-2">3) 창원 산업단지 태양광</h4>
                                <ul className="space-y-1 text-sm">
                                    <li>• 공장 지붕 활용: <strong>500MW</strong></li>
                                    <li>• 기업들 자발적 참여</li>
                                    <li>• RE100 대응</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: "4. 경제적 효과 비교",
                content: (
                    <div className="space-y-4">
                        <div className="bg-gray-100 rounded-lg p-4 overflow-x-auto">
                            <h4 className="font-bold mb-2 text-sm">💰 LNG 2조 vs 재생에너지 2조</h4>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2 text-left">항목</th>
                                        <th className="py-2 text-right text-red-600">LNG</th>
                                        <th className="py-2 text-right text-green-600">재생에너지</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">연료비 (30년)</td>
                                        <td className="py-2 text-right">9조 원</td>
                                        <td className="py-2 text-right font-bold">0원</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">고용 효과</td>
                                        <td className="py-2 text-right">적음</td>
                                        <td className="py-2 text-right font-bold">5배 이상</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">지역 수익</td>
                                        <td className="py-2 text-right">일부</td>
                                        <td className="py-2 text-right font-bold">주민 참여형</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                ),
            },
        ],
        sources: [
            "경상남도청, \"경남 지역에너지계획\" (2024)",
            "녹색에너지전략연구소, \"경남 재생에너지 잠재량 분석\" (2023)",
            "한국풍력산업협회, \"해상풍력 경제 효과 보고서\"",
            "거제시/남해군 해상풍력 사업계획서",
        ],
        closingMessage: "경남은 이미 준비되어 있어요. LNG라는 '과거'가 아니라, 재생에너지라는 '미래'를 선택할 골든타임, 바로 지금입니다!",
    },
];
