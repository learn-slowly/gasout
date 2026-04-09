// 기후시민 밸런스게임 결과 데이터
import { TestResult, ClimateType } from '@/types/climateTest';

export const testResults: Record<ClimateType, TestResult> = {
  'earth-healer': {
    type: 'earth-healer',
    typeName: '지구 감성 보살',
    emoji: '🌿',
    quote: '텀블러 하나에도 진심을 담는 사람. 지구가 보낸 편지에 답장을 쓸 유일한 타입.',
    shareQuote: '나는 지구한테 답장 쓰는 타입',
    description: '텀블러 하나에도 진심을 담는 사람. 지구가 보낸 편지에 답장을 쓸 유일한 타입.',
    axis1Label: '개인실천',
    axis2Label: '감성',
    color: {
      main: '#2d5016',
      dark: '#0d1f05',
      gradient: 'from-[#0d1f05] via-[#1a3a0d] to-[#2d5016]',
    },
  },
  'data-doer': {
    type: 'data-doer',
    typeName: '생활 데이터 실천러',
    emoji: '📊',
    quote: '분리수거에도 최적 동선이 있다. 우리집 탄소배출량, 당연히 엑셀로 관리 중.',
    shareQuote: '내 탄소배출량, 엑셀로 관리 중',
    description: '분리수거에도 최적 동선이 있다. 우리집 탄소배출량, 당연히 엑셀로 관리 중.',
    axis1Label: '개인실천',
    axis2Label: '이성',
    color: {
      main: '#1a3a5c',
      dark: '#091520',
      gradient: 'from-[#091520] via-[#112a42] to-[#1a3a5c]',
    },
  },
  'crying-fighter': {
    type: 'crying-fighter',
    typeName: '울면서 싸우는 투사',
    emoji: '🔥',
    quote: '행동의 연료는 눈물. 울다가 서명 링크 공유하는 게 일상.',
    shareQuote: '울다가 서명 링크 공유하는 편',
    description: '행동의 연료는 눈물. 울다가 서명 링크 공유하는 게 일상.',
    axis1Label: '구조변화',
    axis2Label: '감성',
    color: {
      main: '#5c1a1a',
      dark: '#200808',
      gradient: 'from-[#200808] via-[#3e1010] to-[#5c1a1a]',
    },
  },
  'system-analyst': {
    type: 'system-analyst',
    typeName: '시스템 분석가',
    emoji: '⚡',
    quote: '감정? 그걸로 빙하가 멈추나요. 새벽 3시, 에너지 정책 보고서 읽는 중.',
    shareQuote: '새벽 3시, 에너지 정책 보고서 읽는 중',
    description: '감정? 그걸로 빙하가 멈추나요. 새벽 3시, 에너지 정책 보고서 읽는 중.',
    axis1Label: '구조변화',
    axis2Label: '이성',
    color: {
      main: '#4a3a1a',
      dark: '#1a1508',
      gradient: 'from-[#1a1508] via-[#332a12] to-[#4a3a1a]',
    },
  },
};
