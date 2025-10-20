"use client";

import { useEffect, useRef, useState } from "react";
import { loadKakaoSdk } from "@/src/lib/loadKakaoMap";

type Kakao = any;

type Props = {
  className?: string;
  center?: { lat: number; lng: number };
  level?: number; // zoom level (1~)
};

export default function KakaoMap({ className, center, level = 7 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [kakao, setKakao] = useState<Kakao | null>(null);

  useEffect(() => {
    let mounted = true;
    loadKakaoSdk()
      .then((k) => {
        if (!mounted) return;
        setKakao(k);
      })
      .catch((e) => {
        console.error(e);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!kakao || !containerRef.current) return;
    const map = new kakao.maps.Map(containerRef.current, {
      center: new kakao.maps.LatLng(center?.lat ?? 36.5, center?.lng ?? 127.8),
      level,
    });
    // Keep reference if needed later
    (containerRef.current as any).__map = map;
  }, [kakao, center?.lat, center?.lng, level]);

  return <div ref={containerRef} className={className ?? "w-full h-[480px] rounded-md border"} />;
}


