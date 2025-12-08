// 기후시민 MBTI 테스트 질문 데이터
import { Question, MiniFact } from '@/src/types/climateTest';

export const questions: Question[] = [
  // E/I 차원 (1-3)
  {
    id: 1,
    dimension: 'E/I',
    question: '기후활동을 할 때 어떤 방식이 더 힘이 나나요?',
    optionA: {
      text: '여러 사람과 함께 플로깅·캠페인·집회 같은 활동을 할 때',
      value: 'E',
    },
    optionB: {
      text: '혼자 자료를 찾아보거나 환경 콘텐츠를 만들 때',
      value: 'I',
    },
  },
  {
    id: 2,
    dimension: 'E/I',
    question: '"우리 동네에 LNG 발전소가 들어온대!"라는 소식을 들으면?',
    optionA: {
      text: '바로 친구들에게 공유하고 "우리 같이 알아보자!"',
      value: 'E',
    },
    optionB: {
      text: '혼자 관련 기사·영상을 찾아보고 차분히 공부 시작',
      value: 'I',
    },
  },
  {
    id: 3,
    dimension: 'E/I',
    question: '환경 활동 후 나의 충전 방식은?',
    optionA: {
      text: '사람들과 이야기하며 기후 에너지 급속 충전',
      value: 'E',
    },
    optionB: {
      text: '혼자 자연 속에서 걷거나 음악 듣고 쉬면서 기후 에너지 저속 충전',
      value: 'I',
    },
  },
  // S/N 차원 (4-6)
  {
    id: 4,
    dimension: 'S/N',
    question: '기후위기를 들을 때 어떤 설명이 더 와닿나요?',
    optionA: {
      text: '"우리 동네 온도 30년 동안 몇 도 올랐대" 같은 딱! 보이는 변화',
      value: 'S',
    },
    optionB: {
      text: '"앞으로 우리는 어떤 미래를 살게 될까?" 같은 큰 그림',
      value: 'N',
    },
  },
  {
    id: 5,
    dimension: 'S/N',
    question: 'LNG 발전소가 왜 문제인지 설명할 때?',
    optionA: {
      text: '"메탄 누출, 탄소 배출, 비용이 이렇게 높아요"',
      value: 'S',
    },
    optionB: {
      text: '"결국 우리 미래 에너지의 방향을 뒤로 돌리는 거예요"',
      value: 'N',
    },
  },
  {
    id: 6,
    dimension: 'S/N',
    question: '기후실천을 제안할 때 어떤 말이 더 자연스럽나요?',
    optionA: {
      text: '"일회용컵 몇 개를 줄일 수 있어요"처럼 수치·근거 중심',
      value: 'S',
    },
    optionB: {
      text: '"우리 생활을 바꾸는 첫걸음이에요"처럼 의미 중심',
      value: 'N',
    },
  },
  // T/F 차원 (7-9)
  {
    id: 7,
    dimension: 'T/F',
    question: 'LNG 발전소 건설 반대 이유를 묻는다면?',
    optionA: {
      text: '"재생에너지가 더 싸고 배출량도 적어요"',
      value: 'T',
    },
    optionB: {
      text: '"주민 건강, 생태계 피해… 이건 우리 삶의 문제예요"',
      value: 'F',
    },
  },
  {
    id: 8,
    dimension: 'T/F',
    question: '친구가 플라스틱 줄이기를 어려워한다면?',
    optionA: {
      text: '"이렇게 하면 진짜 쉬워!"하며 실천할 수 있는 해결책 딱!',
      value: 'T',
    },
    optionB: {
      text: '"나도 처음엔 그랬어" 공감하며 함께 작은 변화부터 시작',
      value: 'F',
    },
  },
  {
    id: 9,
    dimension: 'T/F',
    question: '누군가 "환경보다 경제가 더 중요하다"고 말하면?',
    optionA: {
      text: '"둘이 싸우는 게 아니라 같이 갈 수 있어요"라고 근거로 설득',
      value: 'T',
    },
    optionB: {
      text: '"너가 그렇게 느끼는 이유가 있겠지"라고 먼저 마음을 열고 듣기',
      value: 'F',
    },
  },
  // J/P 차원 (10-12)
  {
    id: 10,
    dimension: 'J/P',
    question: "'일주일 제로웨이스트 챌린지'를 하게 된다면?",
    optionA: {
      text: '실천 계획표·오늘의 할 일까지 딱딱 정리하기!',
      value: 'J',
    },
    optionB: {
      text: '그날 가능한 것부터 자연스럽게 슥 실천하기!',
      value: 'P',
    },
  },
  {
    id: 11,
    dimension: 'J/P',
    question: '기후 모임에 처음 가는 날, 당신의 스타일은?',
    optionA: {
      text: '미리 자료를 살펴보고 내 의견도 짧게 정리해 가기',
      value: 'J',
    },
    optionB: {
      text: '일단 가서 분위기 보며 참여하기',
      value: 'P',
    },
  },
  {
    id: 12,
    dimension: 'J/P',
    question: '환경 캠페인 아이디어가 여러 개라면?',
    optionA: {
      text: '하나를 뽑아 바로 실행 준비 돌입!',
      value: 'J',
    },
    optionB: {
      text: '더 좋은 아이디어가 있는지 여유 있게 찾아보기!',
      value: 'P',
    },
  },
  // E/I 차원 추가 (13-14)
  {
    id: 13,
    dimension: 'E/I',
    question: 'SNS에서 기후위기 소식을 봤을 때?',
    optionA: {
      text: '댓글로 내 생각을 남기고 친구들과 토론하고 싶어요',
      value: 'E',
    },
    optionB: {
      text: '좋아요/공유만 누르거나, 조용히 더 찾아보고 싶어요',
      value: 'I',
    },
  },
  {
    id: 14,
    dimension: 'E/I',
    question: '기후 관련 새로운 아이디어가 떠올랐다면?',
    optionA: {
      text: '바로 주변 사람들에게 말하면서 의견을 들어봐요',
      value: 'E',
    },
    optionB: {
      text: '혼자 충분히 생각해보고 다듬은 후에 공유해요',
      value: 'I',
    },
  },
  // S/N 차원 추가 (15-16)
  {
    id: 15,
    dimension: 'S/N',
    question: '재생에너지 관련 뉴스를 읽을 때?',
    optionA: {
      text: '"설치 비용이 얼마지? 효율은?" 구체적 수치가 궁금해요',
      value: 'S',
    },
    optionB: {
      text: '"이게 사회를 어떻게 바꿀까?" 큰 변화가 궁금해요',
      value: 'N',
    },
  },
  {
    id: 16,
    dimension: 'S/N',
    question: '친환경 제품을 선택할 때 중요한 건?',
    optionA: {
      text: '성분, 인증 마크, 실제 사용 후기 같은 확실한 정보',
      value: 'S',
    },
    optionB: {
      text: '이 제품이 추구하는 가치와 철학이 나와 맞는지',
      value: 'N',
    },
  },
  // T/F 차원 추가 (17-18)
  {
    id: 17,
    dimension: 'T/F',
    question: '기후 캠페인을 평가할 때 중요하게 보는 건?',
    optionA: {
      text: '명확한 목표 달성과 측정 가능한 성과가 있는지',
      value: 'T',
    },
    optionB: {
      text: '사람들에게 감동을 주고 마음을 움직였는지',
      value: 'F',
    },
  },
  {
    id: 18,
    dimension: 'T/F',
    question: '환경 다큐멘터리를 볼 때 더 집중하게 되는 장면은?',
    optionA: {
      text: '데이터와 그래프로 문제를 분석하는 전문가 인터뷰',
      value: 'T',
    },
    optionB: {
      text: '기후위기로 고통받는 사람들과 동물의 이야기',
      value: 'F',
    },
  },
  // J/P 차원 추가 (19-20)
  {
    id: 19,
    dimension: 'J/P',
    question: "한 달 동안 '탄소 다이어트'를 하기로 했다면?",
    optionA: {
      text: '매일 체크리스트 만들고 실천 일지 작성할 거예요',
      value: 'J',
    },
    optionB: {
      text: '큰 방향만 정하고 그때그때 할 수 있는 걸 해요',
      value: 'P',
    },
  },
  {
    id: 20,
    dimension: 'J/P',
    question: 'LNG 반대 서명운동에 참여하게 된다면?',
    optionA: {
      text: '목표 인원, 기간, 역할을 정하고 계획적으로 진행',
      value: 'J',
    },
    optionB: {
      text: '일단 시작하고 상황 보면서 유연하게 조정',
      value: 'P',
    },
  },
];

export const miniFacts: MiniFact[] = [
  {
    id: 1,
    title: '💡 알고 가기',
    content: "LNG는 '친환경 연료'가 아니라 **화석 연료**입니다!",
    link: '/learn-more',
  },
  {
    id: 2,
    title: '💡 알고 가기',
    content: 'LNG 발전소는 **좌초자산**이 될 가능성이 높습니다. 장기적으로 가동률이 낮아지면서 투자 손실이 전기요금과 세금 부담으로 이어질 수 있어요.',
    link: '/learn-more',
  },
  {
    id: 3,
    title: '💡 알고 가기',
    content: '재생에너지는 이미 화석연료보다 **더 저렴**해지고 있어요. 에너지 전환은 환경뿐 아니라 경제적으로도 합리적인 선택입니다!',
    link: '/learn-more',
  },
  {
    id: 4,
    title: '💡 알고 가기',
    content: '전 세계가 2050 탄소중립을 선언했지만, LNG 발전소는 30~40년 가동되어야 해요. **수학이 안 맞죠?**',
    link: '/learn-more',
  },
];
