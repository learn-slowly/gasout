import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 프로덕션 빌드 시 ESLint 경고를 무시
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 프로덕션 빌드 시 타입 체크 경고를 무시
    ignoreBuildErrors: true,
  },
  // 빌드 최적화 설정
  experimental: {
    // 메모리 사용량 최적화
    memoryBasedWorkersCount: true,
  },
  // 정적 최적화 설정
  output: 'standalone',
  // 이미지 최적화 비활성화 (메모리 절약)
  images: {
    unoptimized: true,
  },
  // 웹팩 최적화
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
