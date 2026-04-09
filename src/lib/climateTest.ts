// 기후시민 밸런스게임 유틸리티 함수
import { ClimateType, TestAnswer } from '@/types/climateTest';

/**
 * 테스트 응답을 기반으로 기후시민 유형을 계산합니다.
 * 각 축 2문항 중 다수결, 동점 시 첫 문항 우선.
 */
export function calculateClimateType(answers: TestAnswer[]): ClimateType {
  // 축1: 개인실천 vs 구조변화 (Q1, Q2)
  let personalCount = 0;
  let structuralCount = 0;
  // 축2: 감성 vs 이성 (Q3, Q4)
  let emotionalCount = 0;
  let rationalCount = 0;

  for (const answer of answers) {
    switch (answer.answer) {
      case 'personal':
        personalCount++;
        break;
      case 'structural':
        structuralCount++;
        break;
      case 'emotional':
        emotionalCount++;
        break;
      case 'rational':
        rationalCount++;
        break;
    }
  }

  // 동점 시 첫 문항 우선 (personal/emotional이 A이므로 그쪽 우선)
  const isPersonal = personalCount >= structuralCount;
  const isEmotional = emotionalCount >= rationalCount;

  if (isPersonal && isEmotional) return 'earth-healer';
  if (isPersonal && !isEmotional) return 'data-doer';
  if (!isPersonal && isEmotional) return 'crying-fighter';
  return 'system-analyst';
}

// 하위 호환성 별칭
export const calculateMBTIType = calculateClimateType;

/**
 * 세션 ID를 생성합니다.
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * URL에서 UTM 파라미터를 추출합니다.
 */
export function getUTMParams(): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
} {
  if (typeof window === 'undefined') {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
  };
}
