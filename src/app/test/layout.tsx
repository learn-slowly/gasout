import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "기후시민 본능을 깨우세요",
  description: "당신 안의 '기후 시민' - 기후시민 성향 테스트 & 선언하기",
  openGraph: {
    title: "기후시민 본능을 깨우세요",
    description: "당신 안의 '기후 시민' - 기후시민 성향 테스트 & 선언하기",
    images: [
      {
        url: "/og-test.jpg",
        width: 1024,
        height: 1024,
        alt: "기후시민 본능을 깨우세요 - 선언하러 가기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "기후시민 본능을 깨우세요",
    description: "당신 안의 '기후 시민' - 기후시민 성향 테스트 & 선언하기",
    images: ["/og-test.jpg"],
  },
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
