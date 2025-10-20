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
};

export default nextConfig;
