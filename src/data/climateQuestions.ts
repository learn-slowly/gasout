// 기후시민 MBTI 테스트 질문 데이터
import { Question, MiniFact } from '@/src/types/climateTest';

export const questions: Question[] = [
  // E/I 차원 (1-5)
  {
    id: 1,
    dimension: 'E/I',
    question: 'LNG 발전소 건설 계획을 처음 들었을 때, 당신의 첫 반응은?',
    optionA: {
      text: '친구나 가족에게 바로 이야기하며 함께 고민해본다',
      value: 'E',
    },
    optionB: {
      text: '혼자 조용히 자료를 찾아보고 생각해본다',
      value: 'I',
    },
  },
  {
    id: 2,
    dimension: 'E/I',
    question: '기후위기 관련 모임에 참여할 때 선호하는 방식은?',
    optionA: {
      text: '많은 사람들과 함께 토론하고 의견을 나눈다',
      value: 'E',
    },
    optionB: {
      text: '소수의 사람들과 깊이 있게 이야기한다',
      value: 'I',
    },
  },
  {
    id: 3,
    dimension: 'E/I',
    question: '환경 캠페인에 참여한다면?',
    optionA: {
      text: '거리에서 직접 사람들에게 알리고 서명을 받는다',
      value: 'E',
    },
    optionB: {
      text: '온라인으로 콘텐츠를 만들고 공유한다',
      value: 'I',
    },
  },
  {
    id: 4,
    dimension: 'E/I',
    question: 'LNG 발전소 문제를 해결하기 위해 필요한 것은?',
    optionA: {
      text: '많은 사람들의 목소리와 연대',
      value: 'E',
    },
    optionB: {
      text: '정확한 데이터와 논리적 분석',
      value: 'I',
    },
  },
  {
    id: 5,
    dimension: 'E/I',
    question: '기후행동을 할 때 에너지를 얻는 방법은?',
    optionA: {
      text: '사람들과 함께 활동하며 서로 격려한다',
      value: 'E',
    },
    optionB: {
      text: '혼자 집중해서 할 수 있는 일을 찾는다',
      value: 'I',
    },
  },
  // S/N 차원 (6-10)
  {
    id: 6,
    dimension: 'S/N',
    question: 'LNG 발전소에 대해 더 중요하게 생각하는 것은?',
    optionA: {
      text: '현재 구체적인 위험과 문제점',
      value: 'S',
    },
    optionB: {
      text: '미래 세대에게 미칠 장기적 영향',
      value: 'N',
    },
  },
  {
    id: 7,
    dimension: 'S/N',
    question: '기후위기 정보를 접할 때 관심 있는 부분은?',
    optionA: {
      text: '실제 데이터와 통계, 검증된 사실',
      value: 'S',
    },
    optionB: {
      text: '가능한 해결책과 새로운 아이디어',
      value: 'N',
    },
  },
  {
    id: 8,
    dimension: 'S/N',
    question: '환경 문제를 설명할 때 선호하는 방식은?',
    optionA: {
      text: '구체적인 사례와 실제 경험을 들어 설명한다',
      value: 'S',
    },
    optionB: {
      text: '큰 그림과 비전을 그려가며 설명한다',
      value: 'N',
    },
  },
  {
    id: 9,
    dimension: 'S/N',
    question: '재생에너지 전환에 대해 생각할 때?',
    optionA: {
      text: '현재 기술로 가능한 구체적인 방법을 찾는다',
      value: 'S',
    },
    optionB: {
      text: '혁신적인 기술과 새로운 가능성을 상상한다',
      value: 'N',
    },
  },
  {
    id: 10,
    dimension: 'S/N',
    question: '기후행동 계획을 세울 때?',
    optionA: {
      text: '단계별로 실현 가능한 구체적 계획을 세운다',
      value: 'S',
    },
    optionB: {
      text: '장기적인 목표와 비전을 먼저 그린다',
      value: 'N',
    },
  },
  // T/F 차원 (11-15)
  {
    id: 11,
    dimension: 'T/F',
    question: 'LNG 발전소 건설 결정에 대해 평가할 때?',
    optionA: {
      text: '경제성과 효율성을 객관적으로 분석한다',
      value: 'T',
    },
    optionB: {
      text: '지역 주민과 환경에 미치는 영향을 우선 고려한다',
      value: 'F',
    },
  },
  {
    id: 12,
    dimension: 'T/F',
    question: '기후위기 대응 정책을 평가할 때 중요한 것은?',
    optionA: {
      text: '논리적 타당성과 효과성',
      value: 'T',
    },
    optionB: {
      text: '사람들의 감정과 공감대 형성',
      value: 'F',
    },
  },
  {
    id: 13,
    dimension: 'T/F',
    question: '환경 문제를 해결할 때 접근 방식은?',
    optionA: {
      text: '원인과 결과를 분석해 체계적으로 해결한다',
      value: 'T',
    },
    optionB: {
      text: '사람들의 마음을 움직여 함께 변화를 만든다',
      value: 'F',
    },
  },
  {
    id: 14,
    dimension: 'T/F',
    question: '기후행동을 촉진하는 데 효과적인 방법은?',
    optionA: {
      text: '명확한 데이터와 논리적 설득',
      value: 'T',
    },
    optionB: {
      text: '감동적인 스토리와 공감대 형성',
      value: 'F',
    },
  },
  {
    id: 15,
    dimension: 'T/F',
    question: '의견이 다른 사람과 대화할 때?',
    optionA: {
      text: '객관적 사실과 논리로 설득한다',
      value: 'T',
    },
    optionB: {
      text: '상대방의 감정과 가치를 이해하려고 노력한다',
      value: 'F',
    },
  },
  // J/P 차원 (16-20)
  {
    id: 16,
    dimension: 'J/P',
    question: '기후행동 계획을 실행할 때?',
    optionA: {
      text: '미리 계획을 세우고 체계적으로 진행한다',
      value: 'J',
    },
    optionB: {
      text: '상황에 맞춰 유연하게 대응한다',
      value: 'P',
    },
  },
  {
    id: 17,
    dimension: 'J/P',
    question: '환경 캠페인에 참여할 때?',
    optionA: {
      text: '명확한 목표와 일정이 있는 활동을 선호한다',
      value: 'J',
    },
    optionB: {
      text: '자유롭고 창의적인 방식의 활동을 선호한다',
      value: 'P',
    },
  },
  {
    id: 18,
    dimension: 'J/P',
    question: '기후위기 대응에 대한 생각은?',
    optionA: {
      text: '명확한 로드맵과 단계적 계획이 필요하다',
      value: 'J',
    },
    optionB: {
      text: '새로운 정보와 상황에 따라 계속 조정해야 한다',
      value: 'P',
    },
  },
  {
    id: 19,
    dimension: 'J/P',
    question: '기후행동을 실천할 때?',
    optionA: {
      text: '규칙적으로 꾸준히 실천하는 것을 선호한다',
      value: 'J',
    },
    optionB: {
      text: '즉흥적이고 다양한 방법을 시도하는 것을 선호한다',
      value: 'P',
    },
  },
  {
    id: 20,
    dimension: 'J/P',
    question: '환경 문제 해결을 위한 프로젝트에 참여할 때?',
    optionA: {
      text: '명확한 역할과 책임이 있는 프로젝트를 선호한다',
      value: 'J',
    },
    optionB: {
      text: '자유롭게 아이디어를 제안하고 실험할 수 있는 프로젝트를 선호한다',
      value: 'P',
    },
  },
];

export const miniFacts: MiniFact[] = [
  {
    id: 1,
    title: 'LNG도 화석연료입니다',
    content: 'LNG(액화천연가스)는 "깨끗한 에너지"가 아닙니다. 채굴-운송 과정에서 강력한 온실가스인 메탄이 누출되며, 이는 CO2보다 80배 이상 강력한 온실효과를 냅니다.',
    link: '/learn-more',
  },
  {
    id: 2,
    title: '재생에너지가 더 저렴합니다',
    content: '2024년 기준 태양광 발전 단가는 kWh당 30원대로, LNG 발전(50원대)보다 저렴합니다. 전 세계가 재생에너지로 전환하는 이유입니다.',
    link: '/learn-more',
  },
  {
    id: 3,
    title: '좌초자산이 될 위험',
    content: 'LNG 발전소 수명은 30~40년이지만, 2050 탄소중립 목표로 인해 10~15년 내에 사용하지 못하게 될 가능성이 높습니다. 수조원의 세금이 낭비될 수 있습니다.',
    link: '/learn-more',
  },
  {
    id: 4,
    title: '세계는 LNG를 버리고 있습니다',
    content: 'EU는 2035년부터 신규 화석연료 발전소를 금지합니다. 미국과 중국도 재생에너지 투자를 급격히 늘리고 있습니다. 한국만 거꾸로 가고 있습니다.',
    link: '/learn-more',
  },
  {
    id: 5,
    title: '우리에게는 대안이 있습니다',
    content: '경남은 태양광과 해상풍력의 최적지입니다. LNG 발전소 건설비 2조원을 재생에너지에 투자하면 더 많은 일자리와 깨끗한 에너지를 얻을 수 있습니다.',
    link: '/learn-more',
  },
];

