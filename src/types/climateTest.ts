// 기후시민 MBTI 테스트 타입 정의

export type MBTIDimension = 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
export type MBTIType = 
  | 'ENFP' | 'ENFJ' | 'ENTP' | 'ENTJ'
  | 'INFP' | 'INFJ' | 'INTP' | 'INTJ'
  | 'ESFP' | 'ESFJ' | 'ESTP' | 'ESTJ'
  | 'ISFP' | 'ISFJ' | 'ISTP' | 'ISTJ';

export interface Question {
  id: number;
  dimension: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  question: string;
  optionA: {
    text: string;
    value: MBTIDimension;
  };
  optionB: {
    text: string;
    value: MBTIDimension;
  };
}

export interface MiniFact {
  id: number;
  title: string;
  content: string;
  link?: string;
}

export interface TestAnswer {
  questionId: number;
  answer: MBTIDimension;
}

export interface CompatiblePartner {
  type: MBTIType;
  typeName: string;
  emoji: string;
  description: string;
  together: string;
  activity: string;
}

export interface TestResult {
  type: MBTIType;
  typeName: string;
  emoji: string;
  quote: string;
  description: string;
  characteristics: string[];
  strengths: string;
  recommendedActions: string[];
  compatibleTypes?: string[];
  // 기후동지
  bestPartner?: CompatiblePartner;
  heartPartner?: CompatiblePartner;
  synergyPartner?: CompatiblePartner;
}

export interface TestResponse {
  id: string;
  sessionId: string;
  resultType: MBTIType;
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

