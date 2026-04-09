// 기후시민 밸런스게임 테스트 타입 정의

// 축1: 실천 방식
export type Axis1 = 'personal' | 'structural';
// 축2: 관심 동기
export type Axis2 = 'emotional' | 'rational';

// 4유형
export type ClimateType =
  | 'earth-healer'      // 지구 감성 보살 (개인실천 + 감성)
  | 'data-doer'         // 생활 데이터 실천러 (개인실천 + 이성)
  | 'crying-fighter'    // 울면서 싸우는 투사 (구조변화 + 감성)
  | 'system-analyst';   // 시스템 분석가 (구조변화 + 이성)

export interface Question {
  id: number;
  axis: 'axis1' | 'axis2';
  question: string;
  optionA: {
    text: string;
    value: 'personal' | 'structural' | 'emotional' | 'rational';
  };
  optionB: {
    text: string;
    value: 'personal' | 'structural' | 'emotional' | 'rational';
  };
}

export interface TestAnswer {
  questionId: number;
  answer: 'personal' | 'structural' | 'emotional' | 'rational';
}

export interface TestResult {
  type: ClimateType;
  typeName: string;
  emoji: string;
  quote: string;
  shareQuote: string;
  description: string;
  axis1Label: string;
  axis2Label: string;
  color: {
    main: string;
    dark: string;
    gradient: string;
  };
}

export interface TestResponse {
  id: string;
  sessionId: string;
  resultType: ClimateType;
  answers: TestAnswer[];
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  completedAt?: string;
  shared: boolean;
}

export interface ClimateDeclaration {
  id: string;
  testResponseId?: string;
  name: string;
  email: string;
  region?: string;
  phone?: string;
  consentPrivacy: boolean;
  consentMarketing: boolean;
  createdAt: string;
}
