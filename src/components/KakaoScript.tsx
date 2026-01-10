"use client";

import { useEffect } from "react";

export default function KakaoScript() {
  useEffect(() => {
    console.log("[KakaoScript] Component mounted, loading SDK...");
    
    // 이미 로드되었는지 확인
    if (window.Kakao) {
      console.log("[KakaoScript] SDK already loaded");
      return;
    }

    // 스크립트가 이미 DOM에 있는지 확인
    const existingScript = document.querySelector(
      'script[src*="kakao_js_sdk"]'
    );
    
    if (existingScript) {
      console.log("[KakaoScript] Script tag already exists, waiting for load...");
      return;
    }

    // 새로운 스크립트 태그 생성
    const script = document.createElement("script");
    script.src = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js";
    // integrity 체크 제거 (카카오 CDN의 integrity 값이 일치하지 않는 문제)
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => {
      console.log("[KakaoScript] SDK loaded successfully!");
      console.log("[KakaoScript] window.Kakao available:", !!window.Kakao);
    };

    script.onerror = (error) => {
      console.error("[KakaoScript] Failed to load SDK:", error);
    };

    document.body.appendChild(script);
    console.log("[KakaoScript] Script tag appended to body");

    // 클린업
    return () => {
      console.log("[KakaoScript] Cleanup (keeping script for reuse)");
    };
  }, []);

  return null;
}

