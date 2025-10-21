# 🗺️ GasOut - 전국 발전소 현황 및 뉴스 통합 플랫폼

전국 발전소 현황과 관련 뉴스를 지도 중심으로 통합 제공하는 온라인 플랫폼입니다.

## 🚀 주요 기능

### 🗺️ 지도 중심 인터페이스
- **전국 발전소 지도**: Leaflet 기반 인터랙티브 지도
- **연료별 마커 색상**: 석탄(검정), LNG(빨강), 원자력(보라), 기타화력(주황)
- **발전소 정보 패널**: 클릭 시 상세 정보와 연료별 색상 표시
- **반응형 레이아웃**: 모바일/데스크톱 최적화

### 📰 뉴스 통합 시스템
- **자동 뉴스 수집**: Inoreader 웹훅을 통한 실시간 뉴스 수집
- **뉴스 분류**: 전국/지역/발전소 뉴스 자동 분류
- **뉴스 패널**: 필터링 및 검색 기능
- **HTML 엔티티 디코딩**: 뉴스 제목/내용 깨짐 현상 해결

### 🔐 관리자 시스템
- **뉴스 관리**: 기사 승인/거부, 분류, 편집 기능
- **통계 대시보드**: 발전소 현황 및 뉴스 현황 실시간 표시
- **사용자 인증**: Supabase Auth 기반 보안 시스템

## 🛠️ 기술 스택

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **지도**: Leaflet, React-Leaflet
- **UI**: shadcn/ui, Radix UI
- **뉴스 수집**: Inoreader API
- **배포**: Vercel

## 📁 프로젝트 구조

```
web/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지 (지도 중심)
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── map/          # 지도 관련 컴포넌트
│   │   └── ui/            # UI 컴포넌트
│   └── lib/               # 유틸리티 및 설정
└── supabase/              # 데이터베이스 스키마
```

## 🌐 배포

- **프로덕션 URL**: [https://gasout.vercel.app](https://gasout.vercel.app)
- **자동 배포**: GitHub 연동으로 자동 배포
- **환경**: Vercel 플랫폼

## 📊 데이터베이스

- **발전소 데이터**: 615개 발전소 정보
- **뉴스 데이터**: Inoreader를 통한 자동 수집
- **사용자 데이터**: Supabase Auth 기반

## 🔧 개발 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## 📝 참고 문서

- [PRD 문서](./prd.md) - 프로젝트 요구사항 정의
- [진행 현황](./PROGRESS.md) - 개발 진행 상황
- [TODO 리스트](./todolist.md) - 개발 작업 목록
