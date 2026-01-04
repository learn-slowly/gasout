// 기후시민 MBTI 테스트 질문 데이터
import { Question, MiniFact } from '@/src/types/climateTest';

export const questions: Question[] = [
  // ========================================
  // E/I 차원 - 기후행동 에너지 타입 (Q1-5)
  // ========================================
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
  {
    id: 4,
    dimension: 'E/I',
    question: 'SNS에서 기후위기 소식을 봤을 때?',
    optionA: {
      text: '댓글로 내 생각을 남기고 친구들과 토론하고 싶어',
      value: 'E',
    },
    optionB: {
      text: '좋아요/공유만 누르거나, 조용히 더 찾아보고 싶어',
      value: 'I',
    },
  },
  {
    id: 5,
    dimension: 'E/I',
    question: '기후 관련 새로운 아이디어가 떠올랐다면?',
    optionA: {
      text: '바로 주변 사람들에게 말하면서 의견을 들어보자',
      value: 'E',
    },
    optionB: {
      text: '혼자 충분히 생각해보고 다듬은 후에 공유해',
      value: 'I',
    },
  },

  // ========================================
  // S/N 차원 - 기후인식 스타일 (Q6-10)
  // ========================================
  {
    id: 6,
    dimension: 'S/N',
    question: '기후위기를 들을 때 어떤 설명이 더 와닿나요?',
    optionA: {
      text: '"우리 동네 온도가 30년 동안 몇 도 올랐대"',
      value: 'S',
    },
    optionB: {
      text: '"앞으로 우리는 어떤 미래를 살게 될까?"',
      value: 'N',
    },
  },
  {
    id: 7,
    dimension: 'S/N',
    question: 'LNG 발전소가 왜 문제인지 설명할 때?',
    optionA: {
      text: '"메탄 누출, 탄소 배출, 비용이 이렇게 높아"',
      value: 'S',
    },
    optionB: {
      text: '"결국 우리 미래 에너지의 방향을 뒤로 돌리는거야"',
      value: 'N',
    },
  },
  {
    id: 8,
    dimension: 'S/N',
    question: '기후실천을 제안할 때 어떤 말이 더 자연스럽나요?',
    optionA: {
      text: '"이렇게 하면 일회용컵 몇 개를 줄일 수 있어"',
      value: 'S',
    },
    optionB: {
      text: '"우리 생활을 바꾸는 첫걸음이지"',
      value: 'N',
    },
  },
  {
    id: 9,
    dimension: 'S/N',
    question: '재생에너지 관련 뉴스를 읽을 때?',
    optionA: {
      text: '"설치 비용이 얼마지? 효율은?"',
      value: 'S',
    },
    optionB: {
      text: '"이게 사회를 어떻게 바꿀까?"',
      value: 'N',
    },
  },
  {
    id: 10,
    dimension: 'S/N',
    question: '친환경 제품을 선택할 때 중요한 건?',
    optionA: {
      text: '성분, 인증 마크, 실제 사용 후기',
      value: 'S',
    },
    optionB: {
      text: '이 제품이 추구하는 가치와 철학',
      value: 'N',
    },
  },

  // ========================================
  // T/F 차원 - 기후행동의 동기 (Q11-15)
  // ========================================
  {
    id: 11,
    dimension: 'T/F',
    question: 'LNG 발전소 건설 반대 이유를 묻는다면?',
    optionA: {
      text: '"재생에너지가 더 싸고 탄소 배출량도 적어"',
      value: 'T',
    },
    optionB: {
      text: '"주민 건강, 생태계 피해… 이건 우리 삶의 문제야"',
      value: 'F',
    },
  },
  {
    id: 12,
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
    id: 13,
    dimension: 'T/F',
    question: '누군가 "환경보다 경제가 더 중요하다"고 말하면?',
    optionA: {
      text: '"환경도 우리가 치뤄야할 비용이야. 둘은 같이 가아해."',
      value: 'T',
    },
    optionB: {
      text: '"그렇구나. 네가 그렇게 느끼는 이유가 어떤거야?"',
      value: 'F',
    },
  },
  {
    id: 14,
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
    id: 15,
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

  // ========================================
  // J/P 차원 - 기후행동 스타일 (Q16-20)
  // ========================================
  {
    id: 16,
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
    id: 17,
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
    id: 18,
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
  {
    id: 19,
    dimension: 'J/P',
    question: "한 달 동안 '탄소 다이어트'를 하기로 했다면?",
    optionA: {
      text: '매일 체크리스트 만들고 실천 일지 작성할 거야',
      value: 'J',
    },
    optionB: {
      text: '큰 방향만 정하고 그때그때 할 수 있는 걸 해',
      value: 'P',
    },
  },
  {
    id: 20,
    dimension: 'J/P',
    question: '내가 탄소중립 공론장에 참여하게 된다면?',
    optionA: {
      text: '인원과 기간을 확인하고 계획적으로 진행',
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
    link: '/learn-more?fact=1',
  },
  {
    id: 2,
    title: '💡 알고 가기',
    content: 'LNG 발전소는 **좌초자산**이 될 가능성이 높습니다. 장기적으로 가동률이 낮아지면서 투자 손실이 전기요금과 세금 부담으로 이어질 수 있어요.',
    link: '/learn-more?fact=2',
  },
  {
    id: 3,
    title: '💡 알고 가기',
    content: '재생에너지는 이미 화석연료보다 **더 저렴**해지고 있어요. 에너지 전환은 환경뿐 아니라 경제적으로도 합리적인 선택입니다!',
    link: '/learn-more?fact=3',
  },
  {
    id: 4,
    title: '💡 알고 가기',
    content: '전 세계가 2050 탄소중립을 선언했지만, LNG 발전소는 30~40년 가동되어야 해요. **수학이 안 맞죠?**',
    link: '/learn-more?fact=4',
  },
];
