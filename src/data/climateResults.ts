// 기후시민 MBTI 테스트 결과 데이터
import { TestResult, MBTIType } from '@/src/types/climateTest';

export const testResults: Record<MBTIType, TestResult> = {
  // E 유형 (외향형)
  ENFP: {
    type: 'ENFP',
    typeName: '기후 모험가',
    emoji: '🌟',
    quote: '세상을 바꾸는 건 언제나 당신 같은 사람부터 시작돼요!',
    description: '당신은 열정적이고 창의적인 기후 모험가예요. 새로운 아이디어로 사람들을 모으고, 재미있는 방식으로 변화를 만듭니다. 캠페인 기획, 플로깅 챌린지, SNS 콘텐츠 제작 등 어떤 무대든 당신의 에너지가 필요해요.',
    characteristics: [
      '캠페인 기획과 새로운 아이디어로 사람들을 모읍니다',
      '플로깅 챌린지, SNS 콘텐츠 제작 등 재미있는 방식을 선호해요',
      '에너지 넘치는 당신의 열정이 주변을 감염시킵니다',
      '새로운 기후행동을 시도하는 것을 두려워하지 않아요'
    ],
    strengths: '창의적인 아이디어로 기후 캠페인을 기획하고 사람들을 즐겁게 참여시키는 데 탁월합니다!',
    recommendedActions: [
      '친구들과 함께 \'기후 행동 챌린지\' (예: 일주일 텀블러 인증)',
      '친구들과 함께 "LNG 문제 알리기 캠페인" 진행',
      'SNS에서 기후 정보 카드·숏츠 제작해서 공유하기',
      '플로깅(조깅+쓰레기 줍기)데이 기획',
      '온라인 토론방·밴드에서 재생에너지 전환 정보 공유',
      '학교 축제나 동아리에서 작은 기후게임 부스 운영'
    ],
    bestPartner: {
      type: 'ISTJ',
      typeName: '기후 기록가',
      emoji: '📝',
      description: '당신의 넘치는 아이디어를 체계적으로 실행해줘요',
      together: '창의적인 캠페인이 지속 가능한 프로젝트로!',
      activity: '"LNG 반대 시민 참여 플랫폼" 함께 만들기'
    },
    heartPartner: {
      type: 'INFP',
      typeName: '기후 사색가',
      emoji: '🌙',
      description: '같은 이상을 품고 있지만 에너지 방향이 달라 균형잡혀요',
      together: '깊이 있는 메시지를 대중에게 전달',
      activity: '기후위기 스토리텔링 콘텐츠 제작'
    },
    synergyPartner: {
      type: 'INTJ',
      typeName: '기후 설계자',
      emoji: '🏗️',
      description: '당신의 창의성에 전략적 실행력을 더해줘요',
      together: '혁신적 아이디어가 현실이 됨',
      activity: '재생에너지 전환 장기 로드맵 기획'
    }
  },
  
  ENTP: {
    type: 'ENTP',
    typeName: '기후 전략가',
    emoji: '💡',
    quote: '문제를 보면, 당신은 이미 해결책을 그리고 있어요.',
    description: '논리적이고 유머 감각이 뛰어난 당신은 기후 전략가입니다. 토론과 아이디어로 세상을 움직이고, 논쟁 속에서 더 나은 해법을 찾죠. 당신의 통찰력은 기후위기를 \'생각의 전환점\'으로 만들어줍니다.',
    characteristics: [
      '토론과 아이디어로 세상을 움직입니다',
      '논쟁 속에서 더 나은 해법을 찾는 능력이 있어요',
      '유머 감각으로 무거운 주제를 가볍게 풀어냅니다',
      '생각의 전환점을 만드는 통찰력이 있어요'
    ],
    strengths: '논리적 사고와 창의적 통찰로 기후 문제의 새로운 해결책을 제시합니다!',
    recommendedActions: [
      'LNG 발전과 재생에너지 주제로 미니 토론회 개최',
      '학교·단체에 탄소중립 아이디어 제안서 제출',
      '기후위기 팩트체크 콘텐츠 제작하고 공유하기',
      '기후 가짜뉴스 바로잡기 캠페인 운영',
      '친구들과 "우리 학교 탄소 줄이기 전략회의" 운영'
    ],
    bestPartner: {
      type: 'ISFJ',
      typeName: '기후 수호자',
      emoji: '🛡️',
      description: '당신의 혁신적 아이디어를 안정적으로 실행해줘요',
      together: '파격적인 전략이 신뢰받는 활동으로',
      activity: '지역 주민 설득 캠페인'
    },
    heartPartner: {
      type: 'INTP',
      typeName: '기후 분석가',
      emoji: '🔬',
      description: '논리적 사고를 공유하며 더 깊은 통찰로',
      together: '데이터 기반 전략 수립',
      activity: 'LNG 경제성 분석 보고서 작성'
    },
    synergyPartner: {
      type: 'INFJ',
      typeName: '기후 예언자',
      emoji: '🔮',
      description: '전략에 깊은 비전을 더해줘요',
      together: '설득력 있는 미래 시나리오 제시',
      activity: '기후정책 제안서 공동 작성'
    }
  },
  
  ESFP: {
    type: 'ESFP',
    typeName: '기후 퍼포머',
    emoji: '✨',
    quote: '당신이 함께 서면 기후도 빛나요!',
    description: '밝고 자유로운 당신은 기후 퍼포머입니다. 사람들 앞에서 메시지를 전하고, 즐겁게 행동하며 주변에 긍정적인 변화를 만듭니다. 춤, 노래, 패션 등 당신의 표현력은 기후행동을 \'하나의 문화\'로 바꿔요.',
    characteristics: [
      '사람들 앞에서 메시지를 전하는 것을 즐깁니다',
      '춤, 노래, 패션 등으로 기후행동을 표현해요',
      '즐거운 방식으로 주변에 긍정적 변화를 만듭니다',
      '기후행동을 하나의 문화로 만드는 표현력이 있어요'
    ],
    strengths: '즐거운 에너지로 사람들을 기후행동으로 이끄는 퍼포머입니다!',
    recommendedActions: [
      '릴스나 숏츠 댄스 챌린지로 기후 메시지 전달',
      '거리 공연/플래시몹으로 LNG 문제 시각화하기',
      'SNS에서 "LNG vs 친환경 재생에너지" 비교 콘텐츠 제작',
      '일상 속 재활용 또는 친환경 패션 공유하기',
      '"LNG는 화석 연료, 대안은 재생에너지!" 슬로건 공유 활동',
      '"기후 밈 만들기 챌린지" 기획'
    ],
    bestPartner: {
      type: 'INTJ',
      typeName: '기후 설계자',
      emoji: '🏗️',
      description: '당신의 즉흥적 매력에 장기 전략을 더해줘요',
      together: '문화 활동이 체계적 운동으로',
      activity: '기후 페스티벌 기획 및 운영'
    },
    heartPartner: {
      type: 'ISFP',
      typeName: '기후 감성가',
      emoji: '🎨',
      description: '예술적 감각을 공유하며 창의적 표현',
      together: '감성적인 기후 콘텐츠 제작',
      activity: '기후위기 사진/영상 전시'
    },
    synergyPartner: {
      type: 'ENFJ',
      typeName: '기후 가이드',
      emoji: '🌈',
      description: '당신의 표현력에 공감 능력을 더해요',
      together: '대중을 움직이는 캠페인',
      activity: '거리 문화 캠페인'
    }
  },
  
  ESTP: {
    type: 'ESTP',
    typeName: '기후 액션러',
    emoji: '⚡',
    quote: '말보다 행동, 지금 바로 움직이는 당신이 진짜 멋져요.',
    description: '현실적이고 실행력 넘치는 당신은 기후 액션 플레이어예요. 플로깅, 자전거 출퇴근, 현장 봉사 등 당신은 \'즉시 행동\'으로 변화를 만듭니다. 당신의 움직임 하나하나가 기후위기를 늦추는 힘이 됩니다.',
    characteristics: [
      '즉시 행동으로 변화를 만듭니다',
      '플로깅, 자전거 출퇴근 등 실천적인 활동을 좋아해요',
      '현장에서 직접 몸으로 움직이는 것을 선호합니다',
      '실행력이 뛰어나 바로바로 실천해요'
    ],
    strengths: '즉각적인 행동력으로 기후 문제에 직접 맞서는 실천가입니다!',
    recommendedActions: [
      '자전거 출퇴근 챌린지',
      '지역 탐방하며 재생에너지(태양광, 풍력) 설치된 곳 사진 기록',
      '주민 대상 "LNG 문제 바로 알기" 캠페인',
      '업사이클링 워크숍 참여하기',
      '직접 실천 미션 수행 후 SNS 인증하기 (전기 절약)'
    ],
    bestPartner: {
      type: 'INFJ',
      typeName: '기후 예언자',
      emoji: '🔮',
      description: '당신의 즉각 행동에 깊은 의미를 부여해줘요',
      together: '실천이 영감을 주는 운동으로',
      activity: '지역 기후 현장 활동'
    },
    heartPartner: {
      type: 'ISTP',
      typeName: '기후 메이커',
      emoji: '🔧',
      description: '실용적 접근을 공유하며 빠른 문제 해결',
      together: '현장 중심 실천 프로젝트',
      activity: '재생에너지 설치 워크숍'
    },
    synergyPartner: {
      type: 'ENTJ',
      typeName: '기후 개혁가',
      emoji: '⚔️',
      description: '행동력에 구조적 변화를 더해요',
      together: '즉각 실행과 장기 전략의 조화',
      activity: '신속 대응 기후 캠페인'
    }
  },
  
  ESFJ: {
    type: 'ESFJ',
    typeName: '기후 커넥터',
    emoji: '🤝',
    quote: '당신이 있기에, 사람과 사람이 연결돼요.',
    description: '당신은 따뜻한 마음과 배려로 사람을 모으는 기후 커넥터예요. 이웃, 친구, 가족이 함께하는 실천을 이끌고, 공동체 속에서 변화를 키워냅니다. 당신의 친절함은 지구를 잇는 다리입니다.',
    characteristics: [
      '따뜻한 마음으로 사람들을 모읍니다',
      '이웃, 친구, 가족과 함께하는 실천을 이끌어요',
      '공동체 속에서 변화를 키워나갑니다',
      '친절함으로 사람과 사람을 연결해요'
    ],
    strengths: '따뜻한 배려로 공동체의 기후행동을 이끄는 커넥터입니다!',
    recommendedActions: [
      '가족과 함께 \'하루 한 가지 친환경 약속\' 실천하기',
      '친구와 친환경 재생에너지 관련 대화·정보 공유',
      '친구들, 동네 주민들과 분리배출 캠페인 조직',
      '기후 행동 밴드·카톡방 운영 (소식 공유 중심)',
      '학교·직장 내 \'플라스틱 제로데이\' 제안'
    ],
    bestPartner: {
      type: 'INTP',
      typeName: '기후 분석가',
      emoji: '🔬',
      description: '당신의 따뜻함에 논리적 근거를 더해줘요',
      together: '공감 기반 설득이 데이터로 뒷받침됨',
      activity: '주민 설명회 준비 및 진행'
    },
    heartPartner: {
      type: 'ISFJ',
      typeName: '기후 수호자',
      emoji: '🛡️',
      description: '돌봄의 마음을 공유하며 꾸준한 실천',
      together: '지역 커뮤니티 기반 강화',
      activity: '마을 에너지 협동조합 조직'
    },
    synergyPartner: {
      type: 'ENFP',
      typeName: '기후 모험가',
      emoji: '🌟',
      description: '조직력에 창의성을 더해요',
      together: '활기찬 기후 커뮤니티 형성',
      activity: '기후시민 네트워크 구축'
    }
  },
  
  ESTJ: {
    type: 'ESTJ',
    typeName: '기후 관리자',
    emoji: '📋',
    quote: '체계적인 당신 덕분에 지구도 안심해요.',
    description: '책임감 있고 조직적인 당신은 기후 관리자입니다. 명확한 계획과 추진력으로 프로젝트를 완성하고, 제도적 변화를 이끕니다. 당신의 리더십은 실천을 \'지속가능한 시스템\'으로 만듭니다.',
    characteristics: [
      '명확한 계획과 추진력으로 프로젝트를 완성합니다',
      '제도적 변화를 이끄는 리더십이 있어요',
      '실천을 지속가능한 시스템으로 만듭니다',
      '체계적이고 조직적인 접근을 선호해요'
    ],
    strengths: '체계적인 계획과 강력한 추진력으로 기후 프로젝트를 완성시킵니다!',
    recommendedActions: [
      '직장 및 학교 \'탄소 절감 실천 매뉴얼\' 제작',
      '기후행사 운영, 예산·성과 관리 담당하기',
      '축제 및 기후 행사에서 재생에너지 O/X 퀴즈부스 운영',
      '\'탄소 다이어트 주간\' 캠페인 기획 총괄',
      '단체 프로젝트로 LNG 관련 정책/환경 문제 모니터링'
    ],
    bestPartner: {
      type: 'INFP',
      typeName: '기후 사색가',
      emoji: '🌙',
      description: '당신의 체계에 따뜻한 의미를 더해줘요',
      together: '효율적 시스템이 사람 중심으로',
      activity: '지역 기후행동 매뉴얼 제작'
    },
    heartPartner: {
      type: 'ISTJ',
      typeName: '기후 기록가',
      emoji: '📝',
      description: '조직력을 공유하며 완벽한 체계 구축',
      together: '지속 가능한 운영 시스템',
      activity: '기후행동 데이터베이스 관리'
    },
    synergyPartner: {
      type: 'ENTP',
      typeName: '기후 전략가',
      emoji: '💡',
      description: '실행력에 혁신적 아이디어를 더해요',
      together: '새로운 방식의 체계적 접근',
      activity: '기후정책 모니터링 시스템'
    }
  },
  
  ENFJ: {
    type: 'ENFJ',
    typeName: '기후 가이드',
    emoji: '🌈',
    quote: '함께의 힘을 믿는 당신, 지구가 따뜻해집니다.',
    description: '공감과 비전을 함께 품은 당신은 진정한 기후 가이드입니다. 사람들을 설득하고, 연대의 가치를 행동으로 보여줍니다. 당신의 한마디가 공동체의 변화를 이끄는 불씨가 됩니다.',
    characteristics: [
      '공감과 비전을 함께 품고 있습니다',
      '사람들을 설득하고 연대의 가치를 보여줘요',
      '한마디로 공동체의 변화를 이끕니다',
      '진정한 리더십으로 사람들을 움직여요'
    ],
    strengths: '공감과 비전으로 사람들을 기후행동으로 이끄는 진정한 가이드입니다!',
    recommendedActions: [
      '또래 대상 미니 기후 리더십 모임 진행',
      '기후 행동 단체 간 네트워크 구축',
      '강연·인터뷰에서 LNG 현황과 쟁점 사례 소개',
      '"우리 지역 에너지 정책 바꾸기" 슬로건 캠페인 운영',
      '"우리 지역 에너지 바뀌면 뭐가 달라질까?" 토론 진행',
      '"기후 롤모델 스토리" 소개 콘텐츠 만들기'
    ],
    bestPartner: {
      type: 'ISTP',
      typeName: '기후 메이커',
      emoji: '🔧',
      description: '당신의 비전에 실용적 실행력을 더해줘요',
      together: '영감을 주는 리더십이 구체적 결과로',
      activity: '재생에너지 교육 프로그램 운영'
    },
    heartPartner: {
      type: 'INFJ',
      typeName: '기후 예언자',
      emoji: '🔮',
      description: '비전과 통찰을 공유하며 깊은 영향력',
      together: '미래를 보여주는 리더십',
      activity: '기후 비전 공유 강연'
    },
    synergyPartner: {
      type: 'INFP',
      typeName: '기후 사색가',
      emoji: '🌙',
      description: '리더십에 깊은 철학을 더해요',
      together: '가치 중심의 강력한 메시지',
      activity: '기후정의 스토리 발굴'
    }
  },
  
  ENTJ: {
    type: 'ENTJ',
    typeName: '기후 개혁가',
    emoji: '⚔️',
    quote: '미래를 설계하고, 현실을 바꾸는 리더!',
    description: '전략적 사고와 추진력을 갖춘 당신은 기후 개혁가입니다. 문제를 분석하고 시스템을 재구성하며, 구조적 변화를 만들어냅니다. 당신이 그리는 것이 곧 지구의 미래가 됩니다.',
    characteristics: [
      '전략적 사고로 문제를 분석합니다',
      '시스템을 재구성하고 구조적 변화를 만들어요',
      '강력한 추진력으로 목표를 달성합니다',
      '미래를 설계하고 현실을 바꿔요'
    ],
    strengths: '전략적 사고와 강력한 추진력으로 구조적 변화를 만드는 개혁가입니다!',
    recommendedActions: [
      '지역 \'탄소중립 계획\' 설계 시 LNG 문제 반영하기',
      '기후정책 제안서 작성 및 의회 제출 (지역 의원에게 의견 전달하기)',
      '기업 ESG 활동 자문 or 모니터링',
      '미래형 \'탄소중립 도시 모델\' 설계 연구',
      '"시스템을 바꾸는 리더" 온라인 기후 포럼 운영'
    ],
    bestPartner: {
      type: 'ISFP',
      typeName: '기후 감성가',
      emoji: '🎨',
      description: '당신의 전략에 인간적 온기를 더해줘요',
      together: '강력한 개혁이 사람들의 마음을 얻음',
      activity: '지역 에너지 전환 정책 수립'
    },
    heartPartner: {
      type: 'INTJ',
      typeName: '기후 설계자',
      emoji: '🏗️',
      description: '장기 전략을 공유하며 완벽한 로드맵',
      together: '체계적 구조 개혁',
      activity: '탄소중립 실행계획 작성'
    },
    synergyPartner: {
      type: 'ENFP',
      typeName: '기후 모험가',
      emoji: '🌟',
      description: '추진력에 창의성을 더해요',
      together: '혁신적이면서 실현 가능한 변화',
      activity: '기후혁신 프로젝트 리드'
    }
  },
  
  // I 유형 (내향형)
  INFP: {
    type: 'INFP',
    typeName: '기후 사색가',
    emoji: '🌙',
    quote: '조용하지만 깊은 당신의 마음이 지구를 위로합니다.',
    description: '감수성 깊은 당신은 기후 사색가예요. 글쓰기, 독서 모임, 예술을 통해 자신의 생각을 표현하고 기후위기 속 희망을 찾습니다. 당신의 한 문장이 누군가의 실천을 이끌어냅니다.',
    characteristics: [
      '깊은 감수성으로 기후 문제를 바라봅니다',
      '글쓰기와 예술로 생각을 표현해요',
      '기후위기 속에서도 희망을 찾습니다',
      '한 문장으로 누군가의 마음을 움직여요'
    ],
    strengths: '깊은 감수성과 표현력으로 사람들의 마음에 희망을 심는 사색가입니다!',
    recommendedActions: [
      '기후 관련 책·영화 감상 후 에세이 작성',
      'SNS나 블로그에 "LNG 발전소와 주민 피해" 기록',
      '기후문학/예술 워크숍 참여',
      '작은 글로 재생에너지 필요성 표현하기',
      '\'나의 기후 감정 일기\' 쓰기',
      '기후감정(Climate Anxiety) 치유 모임 참여'
    ],
    bestPartner: {
      type: 'ESTJ',
      typeName: '기후 관리자',
      emoji: '📋',
      description: '당신의 이상에 체계적 실행력을 더해줘요',
      together: '깊은 가치가 현실로 구현됨',
      activity: '기후정의 메시지를 시스템화'
    },
    heartPartner: {
      type: 'ENFP',
      typeName: '기후 모험가',
      emoji: '🌟',
      description: '가치관을 공유하며 이상을 실현',
      together: '의미 있는 창의적 활동',
      activity: '기후 스토리텔링 콘텐츠'
    },
    synergyPartner: {
      type: 'ENFJ',
      typeName: '기후 가이드',
      emoji: '🌈',
      description: '사색에 리더십을 더해요',
      together: '깊은 철학이 대중에게 전달됨',
      activity: '기후감정 치유 모임'
    }
  },
  
  INFJ: {
    type: 'INFJ',
    typeName: '기후 예언자',
    emoji: '🔮',
    quote: '미래를 보는 당신의 눈빛에, 변화의 길이 있습니다.',
    description: '통찰력 있고 신념이 강한 당신은 기후 예언자입니다. 지금보다 나은 세상을 상상하고, 그 비전을 사람들과 나눕니다. 당신의 조용한 리더십이 공동체의 방향을 밝혀줍니다.',
    characteristics: [
      '통찰력으로 미래를 내다봅니다',
      '지금보다 나은 세상을 상상하고 비전을 나눠요',
      '조용하지만 강한 리더십이 있습니다',
      '공동체의 방향을 밝혀주는 신념이 있어요'
    ],
    strengths: '깊은 통찰력과 비전으로 공동체의 방향을 제시하는 예언자입니다!',
    recommendedActions: [
      '"내가 꿈꾸는 미래 에너지" 비전 카드 만들기',
      '학교·지역 내 기후 교육 콘텐츠 구상',
      '미래 세대를 위한 기후 메시지 카드 만들기/편지 쓰기',
      '\'나의 기후 비전 선언문\' 작성 및 공유',
      '인문학적 관점의 기후 토론회 참여'
    ],
    bestPartner: {
      type: 'ESTP',
      typeName: '기후 액션러',
      emoji: '⚡',
      description: '당신의 비전에 즉각 실행력을 더해줘요',
      together: '통찰이 현장에서 바로 실현됨',
      activity: '비전 제시 후 현장 캠페인'
    },
    heartPartner: {
      type: 'ENFJ',
      typeName: '기후 가이드',
      emoji: '🌈',
      description: '통찰력을 공유하며 강력한 영향력',
      together: '사람들을 변화시키는 리더십',
      activity: '기후 교육 프로그램 기획'
    },
    synergyPartner: {
      type: 'ENTP',
      typeName: '기후 전략가',
      emoji: '💡',
      description: '비전에 창의적 전략을 더해요',
      together: '미래지향적 혁신 전략',
      activity: '장기 기후정책 로드맵'
    }
  },
  
  ISFP: {
    type: 'ISFP',
    typeName: '기후 감성가',
    emoji: '🎨',
    quote: '당신의 감성이 세상을 아름답게 물들입니다.',
    description: '섬세하고 미적 감각이 풍부한 당신은 기후 감성가예요. 자연의 아름다움을 지키고 표현하는 당신의 예술은 사람들에게 \'지구를 사랑하는 마음\'을 일깨워줍니다.',
    characteristics: [
      '섬세한 감성으로 자연의 아름다움을 느낍니다',
      '예술로 지구를 사랑하는 마음을 표현해요',
      '미적 감각으로 환경을 아름답게 가꿉니다',
      '조용하지만 강렬한 메시지를 전달해요'
    ],
    strengths: '섬세한 예술적 감각으로 자연의 소중함을 표현하는 감성가입니다!',
    recommendedActions: [
      '기후 변화 사진 전시 참여',
      '버려진 소재, 재활용 소재로 미술 작품 제작',
      '친환경 브랜드 리뷰 콘텐츠 만들기',
      '자연을 담은 포스터·아트북 만들기',
      '감성적 기후 메시지, 친환경 재생에너지 전환 메시지를 담은 디자인 캠페인 기획'
    ],
    bestPartner: {
      type: 'ENTJ',
      typeName: '기후 개혁가',
      emoji: '⚔️',
      description: '당신의 감성에 강력한 추진력을 더해줘요',
      together: '예술적 메시지가 구조적 변화로',
      activity: '감성 캠페인을 정책 제안으로'
    },
    heartPartner: {
      type: 'ESFP',
      typeName: '기후 퍼포머',
      emoji: '✨',
      description: '감각적 표현을 공유하며 창의적 활동',
      together: '아름다운 기후 문화 콘텐츠',
      activity: '기후 예술 프로젝트'
    },
    synergyPartner: {
      type: 'INFJ',
      typeName: '기후 예언자',
      emoji: '🔮',
      description: '예술에 깊은 의미를 더해요',
      together: '감동적인 기후 메시지',
      activity: '생태 예술 전시'
    }
  },
  
  ISFJ: {
    type: 'ISFJ',
    typeName: '기후 수호자',
    emoji: '🛡️',
    quote: '작은 배려가 지구를 지키는 가장 큰 힘이에요.',
    description: '성실하고 따뜻한 마음의 당신은 기후 수호자입니다. 가까운 이들과의 실천을 꾸준히 이어갑니다. 조용하지만 꾸준한 당신의 손길이 지구를 지킵니다.',
    characteristics: [
      '성실하고 따뜻한 마음을 가지고 있습니다',
      '가까운 이들과 함께 꾸준히 실천해요',
      '작은 배려로 큰 변화를 만듭니다',
      '조용하지만 확실한 손길로 지구를 지켜요'
    ],
    strengths: '꾸준한 실천과 따뜻한 배려로 지구를 지키는 수호자입니다!',
    recommendedActions: [
      '가정 내 일상 실천 (분리배출, 전기 절약, 잔반 줄이기)',
      '"나의 친환경 루틴 리스트" 만들어 친구들과 공유',
      '어린이·가족 대상 환경 교육 봉사 참여',
      '지역 재활용 캠페인 진행',
      '조용하지만 꾸준한 "매일 하나 기후 실천" 스티커 챌린지'
    ],
    bestPartner: {
      type: 'ENTP',
      typeName: '기후 전략가',
      emoji: '💡',
      description: '당신의 꾸준함에 혁신적 아이디어를 더해줘요',
      together: '안정적 실천에 새로운 방법 도입',
      activity: '지역 실천을 혁신적으로 확장'
    },
    heartPartner: {
      type: 'ESFJ',
      typeName: '기후 커넥터',
      emoji: '🤝',
      description: '돌봄의 마음을 공유하며 커뮤니티 강화',
      together: '따뜻한 지역 기후 공동체',
      activity: '마을 단위 실천 프로젝트'
    },
    synergyPartner: {
      type: 'INTJ',
      typeName: '기후 설계자',
      emoji: '🏗️',
      description: '실천에 장기 전략을 더해요',
      together: '지속 가능한 시스템 구축',
      activity: '체계적 환경 실천 매뉴얼'
    }
  },
  
  INTJ: {
    type: 'INTJ',
    typeName: '기후 설계자',
    emoji: '🏗️',
    quote: '당신의 설계도 위에, 지속가능한 미래가 자라납니다.',
    description: '치밀하고 전략적인 당신은 기후 설계자예요. 데이터와 계획으로 장기적인 해결책을 세우며, 기술적 접근으로 변화를 이끕니다. 당신의 비전은 \'지속 가능한 미래\'를 그립니다.',
    characteristics: [
      '치밀한 계획과 전략으로 미래를 설계합니다',
      '데이터 기반의 장기적 해결책을 세워요',
      '기술적 접근으로 효율적인 변화를 만듭니다',
      '지속 가능한 시스템을 구축해요'
    ],
    strengths: '전략적 사고와 데이터 분석으로 지속가능한 미래를 설계하는 건축가입니다!',
    recommendedActions: [
      '탄소 감축 데이터 분석 및 보고서 작성하기',
      '집에서 전력 사용 패턴 분석해보기',
      '"재생에너지 전환 로드맵" 만들어보기',
      '장기적 에너지 전환 로드맵 설계 시 LNG 영향 반영하기',
      '미래형 \'지속가능한 지역 모델\' 스케치',
      'AI 기술을 활용한 탄소 감축 솔루션 기획'
    ],
    bestPartner: {
      type: 'ESFP',
      typeName: '기후 퍼포머',
      emoji: '✨',
      description: '당신의 계획에 즉흥적 매력을 더해줘요',
      together: '전략이 사람들에게 매력적으로 전달됨',
      activity: '재생에너지 전환 로드맵 홍보'
    },
    heartPartner: {
      type: 'ENTJ',
      typeName: '기후 개혁가',
      emoji: '⚔️',
      description: '전략적 사고를 공유하며 강력한 시너지',
      together: '완벽한 장기 개혁 전략',
      activity: '시스템 변화 마스터플랜'
    },
    synergyPartner: {
      type: 'ENFP',
      typeName: '기후 모험가',
      emoji: '🌟',
      description: '설계에 창의성을 더해요',
      together: '혁신적이고 실현 가능한 비전',
      activity: '미래 에너지 시스템 설계'
    }
  },
  
  INTP: {
    type: 'INTP',
    typeName: '기후 분석가',
    emoji: '🔬',
    quote: '사실과 근거로, 지구를 더 똑똑하게 지켜요.',
    description: '호기심 많고 분석적인 당신은 기후 분석가입니다. 데이터를 탐구하고 과학적 사고로 문제를 이해합니다. 당신의 냉철한 시선은 진짜 변화를 위한 방향을 제시합니다.',
    characteristics: [
      '호기심으로 기후 데이터를 깊이 탐구합니다',
      '과학적 사고로 문제의 본질을 이해해요',
      '냉철한 분석으로 진짜 해결책을 찾습니다',
      '논리적 근거로 효과적인 방향을 제시해요'
    ],
    strengths: '과학적 분석과 논리적 사고로 기후 문제의 본질을 파악하는 분석가입니다!',
    recommendedActions: [
      '데이터 시각화로 지역 탄소 배출량 비교',
      '"과학으로 보는 기후위기" 정리 콘텐츠 제작',
      'LNG·전력 정책 관련 인포그래픽·카드뉴스 제작',
      '데이터 시각화로 전력·배출 현황 비교',
      '기후 관련 논문·보고서 읽고 \'쉽게 풀어쓰기\'',
      '실험적 프로젝트 참여 (전력 사용 모니터링 등)'
    ],
    bestPartner: {
      type: 'ESFJ',
      typeName: '기후 커넥터',
      emoji: '🤝',
      description: '당신의 분석에 공감 능력을 더해줘요',
      together: '데이터가 사람들에게 와닿는 메시지로',
      activity: '주민 대상 LNG 문제 설명회'
    },
    heartPartner: {
      type: 'ENTP',
      typeName: '기후 전략가',
      emoji: '💡',
      description: '논리적 사고를 공유하며 깊은 분석',
      together: '철저한 근거 기반 전략',
      activity: '기후 데이터 분석 보고서'
    },
    synergyPartner: {
      type: 'INFJ',
      typeName: '기후 예언자',
      emoji: '🔮',
      description: '분석에 통찰력을 더해요',
      together: '데이터 속 미래 패턴 발견',
      activity: '기후위기 시나리오 분석'
    }
  },
  
  ISTP: {
    type: 'ISTP',
    typeName: '기후 메이커',
    emoji: '🔧',
    quote: '당신의 손끝이 세상을 고칩니다.',
    description: '실용적이고 손재주가 좋은 당신은 기후 메이커예요. 버려진 물건을 고치고 새롭게 만들며, 자원 순환의 가치를 몸으로 보여줍니다. 당신의 기술은 \'지속가능한 생활\'을 현실로 만듭니다.',
    characteristics: [
      '실용적인 손재주로 물건을 고치고 만듭니다',
      '버려진 것에 새 생명을 불어넣어요',
      '자원 순환의 가치를 직접 실천합니다',
      '기술로 지속가능한 생활을 만들어요'
    ],
    strengths: '뛰어난 손재주와 실용성으로 자원 순환을 실천하는 메이커입니다!',
    recommendedActions: [
      '업사이클링·수리 워크숍 참여',
      '고장난 가전, 자전거, 가구 직접 수리',
      '\'고쳐 쓰기 챌린지\', \'LNG 정보 공유 챌린지\' SNS에서 활동',
      '재활용 DIY 키트 제작하기',
      '지역 수리카페 공방 참여',
      '"재생에너지 실험 키트" 만들기 도전 (태양광 작은 조명 등)'
    ],
    bestPartner: {
      type: 'ENFJ',
      typeName: '기후 가이드',
      emoji: '🌈',
      description: '당신의 실용성에 비전과 의미를 더해줘요',
      together: '만드는 것이 영감을 주는 활동으로',
      activity: '재생에너지 DIY 교육'
    },
    heartPartner: {
      type: 'ESTP',
      typeName: '기후 액션러',
      emoji: '⚡',
      description: '실행력을 공유하며 빠른 결과 도출',
      together: '현장 중심 실천 프로젝트',
      activity: '업사이클링 워크숍'
    },
    synergyPartner: {
      type: 'INTJ',
      typeName: '기후 설계자',
      emoji: '🏗️',
      description: '기술에 장기 전략을 더해요',
      together: '실용적 기술이 시스템으로',
      activity: '지역 재생에너지 인프라 구축'
    }
  },
  
  ISTJ: {
    type: 'ISTJ',
    typeName: '기후 기록가',
    emoji: '📝',
    quote: '꾸준함은 언제나 변화를 만든다.',
    description: '꼼꼼하고 책임감 있는 당신은 기후 기록가입니다. 실천을 기록하고 데이터를 정리하며, 행동의 역사를 남깁니다. 당신의 한 줄 한 줄이 기후시민 사회의 기반이 됩니다.',
    characteristics: [
      '꼼꼼하게 실천을 기록하고 정리합니다',
      '책임감 있게 행동의 역사를 남겨요',
      '데이터로 변화의 과정을 증명합니다',
      '꾸준한 실천으로 사회의 기반을 만들어요'
    ],
    strengths: '꼼꼼한 기록과 꾸준한 실천으로 기후행동의 역사를 만드는 기록가입니다!',
    recommendedActions: [
      '나의 탄소발자국 기록표 작성',
      '실천 일지/가계부로 에너지 절약 모니터링',
      '친환경 에너지 전환을 요구하는 단체 활동을 기록하고 정리',
      '재생에너지 관련 자료 모아 \'정리 노트\' 만들기',
      '"기후실천 100일 다이어리" 챌린지'
    ],
    bestPartner: {
      type: 'ENFP',
      typeName: '기후 모험가',
      emoji: '🌟',
      description: '당신의 체계에 창의적 아이디어를 더해줘요',
      together: '열정이 지속 가능한 프로젝트로',
      activity: '기후행동 플랫폼 운영'
    },
    heartPartner: {
      type: 'ESTJ',
      typeName: '기후 관리자',
      emoji: '📋',
      description: '책임감을 공유하며 완벽한 시스템',
      together: '체계적이고 지속 가능한 운영',
      activity: '기후데이터 아카이브 구축'
    },
    synergyPartner: {
      type: 'ENTP',
      typeName: '기후 전략가',
      emoji: '💡',
      description: '기록에 혁신적 해석을 더해요',
      together: '데이터가 전략적 인사이트로',
      activity: '기후행동 성과 분석 리포트'
    }
  },
};
