// 기후시민 밸런스게임 질문 데이터
import { Question } from '@/types/climateTest';

export const questions: Question[] = [
  // Q1. 축1 (개인실천 vs 구조변화)
  {
    id: 1,
    axis: 'axis1',
    question: '환경부 장관이 됐어요. 첫 출근 날 무슨 일 부터 하실거에요?',
    optionA: {
      text: '구내식당 메뉴를 전부 비건으로 바꾼다',
      value: 'personal',
    },
    optionB: {
      text: '탄소배출 상위 100대 기업 명단을 공개한다',
      value: 'structural',
    },
  },
  // Q2. 축1 (개인실천 vs 구조변화)
  {
    id: 2,
    axis: 'axis1',
    question: '지구 살리기 게임에서 스킬 하나를 고를 수 있다면 어떤 스킬을 고르실래요?',
    optionA: {
      text: '[생활습관 전파] — 반경 100m 사람들이 텀블러를 쓰기 시작한다',
      value: 'personal',
    },
    optionB: {
      text: '[정책 해킹] — 내가 쓴 법안이 자동으로 국회를 통과한다',
      value: 'structural',
    },
  },
  // Q3. 축2 (감성 vs 이성)
  {
    id: 3,
    axis: 'axis2',
    question: '기후위기 뉴스를 요약하는 AI가 생겼어요. 어떤 스타일로 설정하실래요?',
    optionA: {
      text: '"오늘도 지구가 울고 있어요😢" 감성 브리핑',
      value: 'emotional',
    },
    optionB: {
      text: '"CO₂ 농도 424ppm, 전월 대비 +2.1" 데이터 리포트',
      value: 'rational',
    },
  },
  // Q4. 축2 (감성 vs 이성)
  {
    id: 4,
    axis: 'axis2',
    question: '지구가 자기소개를 했어요. 뭐라고 했을까요?',
    optionA: {
      text: '"나 46억살인데 요즘 처음으로 좀 무섭다"',
      value: 'emotional',
    },
    optionB: {
      text: '"첨부파일: 기온변화.xlsx, 해수면.csv, 멸종목록_v3.pdf"',
      value: 'rational',
    },
  },
];
