// 카카오 SDK 유틸리티
declare global {
  interface Window {
    Kakao: any;
  }
}

/**
 * 카카오 SDK 초기화
 * 환경변수 NEXT_PUBLIC_KAKAO_APP_KEY에 카카오 JavaScript 키를 설정하세요
 */
export function initKakao() {
  if (typeof window === 'undefined') {
    console.log('[Kakao] Server-side, skipping initialization');
    return false;
  }
  
  if (!window.Kakao) {
    console.warn('[Kakao] SDK not loaded yet. Waiting...');
    return false;
  }

  if (window.Kakao.isInitialized()) {
    console.log('[Kakao] Already initialized');
    return true;
  }

  // 카카오 JavaScript 키 (환경변수에서 가져오기)
  const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
  
  console.log('[Kakao] Attempting initialization with key:', kakaoKey ? `${kakaoKey.substring(0, 10)}...` : 'undefined');
  
  if (!kakaoKey) {
    console.error('[Kakao] NEXT_PUBLIC_KAKAO_APP_KEY가 설정되지 않았습니다.');
    console.info('[Kakao] 카카오 개발자 센터(https://developers.kakao.com)에서 앱을 생성하고 JavaScript 키를 .env.local에 추가하세요.');
    return false;
  }

  try {
    window.Kakao.init(kakaoKey);
    console.log('[Kakao] SDK initialized successfully:', window.Kakao.isInitialized());
    return true;
  } catch (error) {
    console.error('[Kakao] Initialization error:', error);
    return false;
  }
}

/**
 * 카카오톡 공유하기
 */
export function shareToKakao(params: {
  title: string;
  description: string;
  imageUrl?: string;
  linkUrl: string;
  buttonText?: string;
}) {
  console.log('[Kakao Share] Starting share with params:', params);
  
  if (typeof window === 'undefined') {
    console.error('[Kakao Share] Server-side environment');
    return false;
  }

  if (!window.Kakao) {
    console.error('[Kakao Share] SDK not loaded');
    alert('카카오톡 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    console.log('[Kakao Share] SDK not initialized, attempting to initialize...');
    const initialized = initKakao();
    if (!initialized) {
      console.error('[Kakao Share] Initialization failed');
      alert('카카오톡 공유 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
      return false;
    }
  }

  try {
    console.log('[Kakao Share] Sending default share...');
    
    // 테스트 시작 페이지 URL (결과 페이지가 아닌)
    const testStartUrl = `${window.location.origin}/test`;
    
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: params.title,
        description: params.description,
        imageUrl: params.imageUrl || `${window.location.origin}/climate-mbti-og.png`,
        link: {
          mobileWebUrl: testStartUrl,
          webUrl: testStartUrl,
        },
      },
      buttons: [
        {
          title: '나도 테스트하기',
          link: {
            mobileWebUrl: testStartUrl,
            webUrl: testStartUrl,
          },
        },
      ],
    });
    console.log('[Kakao Share] Share successful');
    return true;
  } catch (error) {
    console.error('[Kakao Share] Error:', error);
    alert(`카카오톡 공유에 실패했습니다.\n에러: ${error}\n\n링크 복사를 이용해주세요.`);
    return false;
  }
}

/**
 * 카카오톡 스토리 공유하기
 */
export function shareToKakaoStory(params: {
  url: string;
  text?: string;
}) {
  if (typeof window === 'undefined') return false;

  if (!window.Kakao) {
    alert('카카오 스토리 공유 기능을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return false;
  }

  if (!window.Kakao.isInitialized()) {
    initKakao();
  }

  try {
    window.Kakao.Story.share({
      url: params.url,
      text: params.text,
    });
    return true;
  } catch (error) {
    console.error('카카오 스토리 공유 실패:', error);
    alert('카카오 스토리 공유에 실패했습니다.');
    return false;
  }
}

