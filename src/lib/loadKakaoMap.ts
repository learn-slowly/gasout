let kakaoLoadPromise: Promise<any> | null = null;

export function loadKakaoSdk(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Kakao SDK can only be loaded in the browser"));
  }

  // Already loaded
  if ((window as any).kakao && (window as any).kakao.maps) {
    return Promise.resolve((window as any).kakao);
  }

  if (kakaoLoadPromise) return kakaoLoadPromise;

  const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
  if (!appKey) {
    return Promise.reject(new Error("Missing NEXT_PUBLIC_KAKAO_MAP_API_KEY"));
  }

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=${appKey}`;
    script.async = true;
    script.onload = () => {
      try {
        (window as any).kakao.maps.load(() => {
          resolve((window as any).kakao);
        });
      } catch (e) {
        reject(e);
      }
    };
    script.onerror = () => reject(new Error("Failed to load Kakao Maps SDK"));
    document.head.appendChild(script);
  });

  return kakaoLoadPromise;
}


