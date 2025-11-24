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
    question: ''일주일 제로웨이스트 챌린지'를 하게 된다면?',
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
];

export const miniFacts: MiniFact[] = [
  {
    id: 1,
    title: 'LNG는 친환경 연료가 아니라 화석 연료입니다',
    content: 'LNG(액화천연가스)는 "깨끗한 에너지"가 아닙니다. 채굴-운송 과정에서 강력한 온실가스인 메탄이 누출되며, 이는 CO2보다 80배 이상 강력한 온실효과를 냅니다.',
    link: '/learn-more',
  },
  {
    id: 2,
    title: 'LNG는 좌초자산이 될 가능성이 높습니다',
    content: 'LNG 발전소 수명은 30~40년이지만, 2050 탄소중립 목표로 인해 10~15년 내에 사용하지 못하게 될 가능성이 높습니다. 장기적으로 가동률이 낮아지면서 투자 손실이 전기요금과 세금 부담으로 이어질 수 있어요.',
    link: '/learn-more',
  },
  {
    id: 3,
    title: '재생에너지는 이미 화석연료보다 더 저렴해지고 있어요',
    content: '2024년 기준 태양광 발전 단가는 kWh당 30원대로, LNG 발전(50원대)보다 저렴합니다. 에너지 전환은 환경뿐 아니라 경제적으로도 합리적인 선택입니다!',
    link: '/learn-more',
  },
];
