// 기후시민 MBTI 테스트 유틸리티 함수
import { MBTIDimension, MBTIType, TestAnswer } from '@/types/climateTest';

/**
 * 테스트 응답을 기반으로 MBTI 유형을 계산합니다.
 */
export function calculateMBTIType(answers: TestAnswer[]): MBTIType {
  const counts: Record<MBTIDimension, number> = {
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  };

  // 각 답변을 카운트
  answers.forEach((answer) => {
    counts[answer.answer]++;
  });

  // 각 차원별로 결정
  const eOrI: 'E' | 'I' = counts.E >= counts.I ? 'E' : 'I';
  const sOrN: 'S' | 'N' = counts.S >= counts.N ? 'S' : 'N';
  const tOrF: 'T' | 'F' = counts.T >= counts.F ? 'T' : 'F';
  const jOrP: 'J' | 'P' = counts.J >= counts.P ? 'J' : 'P';

  // MBTI 유형 조합
  return `${eOrI}${sOrN}${tOrF}${jOrP}` as MBTIType;
}

/**
 * calculateResultType은 calculateMBTIType의 별칭입니다.
 */
export const calculateResultType = calculateMBTIType;

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

/**
 * 결과 이미지를 생성합니다 (나중에 구현)
 */
export async function generateResultImage(
  type: MBTIType,
  typeName: string
): Promise<string> {
  // TODO: Canvas API를 사용하여 결과 이미지 생성
  // 현재는 placeholder 반환
  return '';
}

