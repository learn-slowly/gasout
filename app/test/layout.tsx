// 기후 테스트 페이지는 Header를 표시하지 않음 (선택사항)
export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

