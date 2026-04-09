import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "나는 어떤 기후시민일까?",
  description: "4문항 밸런스게임으로 나의 기후시민 유형 알아보기",
  openGraph: {
    title: "나는 어떤 기후시민일까?",
    description: "4문항 밸런스게임으로 나의 기후시민 유형 알아보기",
    images: [
      {
        url: "/og-test.jpg",
        width: 1024,
        height: 1024,
        alt: "나는 어떤 기후시민일까? - 밸런스게임",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "나는 어떤 기후시민일까?",
    description: "4문항 밸런스게임으로 나의 기후시민 유형 알아보기",
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
