# PRD: 전국 발전소 현황 및 뉴스 통합 플랫폼

- **문서 버전:** 2.2
- **작성일:** 2025년 10월 18일 (업데이트: 2026년 1월 3일)
- **프로젝트명:** GasOut (가칭)

## 1. 개요 (Overview)

본 문서는 전국 발전소 현황과 관련 뉴스를 통합적으로 제공하는 온라인 플랫폼 개발에 대한 요구사항을 정의합니다. **'전국 모든 발전소'**로 범위를 확장하고, **모바일 퍼스트(Mobile-First)** 전략을 통해 모바일 환경에서 최상의 사용자 경험을 제공합니다. 
주요 특징으로는 **'인터랙티브 지도'** 기반의 정보 탐색, **'뉴스 통합 시스템'**, 그리고 사용자 참여를 유도하는 **'기후시민 유형 테스트(MBTI)'**가 있습니다.

## 2. 프로젝트 목표 (Goals)

1.  **모바일 퍼스트 경험:** 모바일 기기에서의 사용성을 최우선으로 고려한 UI/UX를 구축한다 (지도 중심 레이아웃, Bottom Sheet 활용).
2.  **지도 중심 정보 시각화:** 전국 발전소 현황을 직관적으로 시각화하고, 복잡한 정보를 심플하게 전달한다.
3.  **뉴스-지도 연계:** 지역별/발전소별 뉴스를 지도와 유기적으로 연동하여 정보의 맥락을 제공한다.
4.  **사용자 참여 유도:** 기후시민 유형 테스트와 같은 인터랙티브 콘텐츠를 통해 사용자의 관심과 참여를 높인다.
5.  **실시간 정보 통합:** 자동 뉴스 수집 및 관리 시스템을 통해 최신 정보를 신속하게 제공한다.

## 3. 사용자 정의 및 역할 (User Personas & Roles)

| 사용자 그룹 | 설명 | 주요 활동 | 권한 |
| :--- | :--- | :--- | :--- |
| **일반 방문자** | 기후 문제에 관심 있는 시민, 학생 등 | 지도 탐색, 뉴스 열람, 기후시민 테스트 참여, 정보 공유 | **읽기 전용 (Read-only)** |
| **뉴스 관리자** | 뉴스 큐레이션 담당자 | 수집된 뉴스 검토 및 승인, 태깅, 위치 정보 매핑 | **뉴스 관리 권한** |
| **전체 관리자** | 플랫폼 운영자 | 전체 데이터 및 사용자 관리, 시스템 설정 | **모든 권한 (Full Access)** |

## 4. 핵심 기능 요구사항 (Feature Requirements)

#### 4.1. 지도 중심 메인 화면 (모바일 퍼스트)
- **[F-1.1] 반응형 레이아웃:** 
    - **모바일:** 지도가 화면의 전체(Full Height)를 차지하며, 주요 기능은 하단 **Floating Action Button (FAB)** 및 **Bottom Sheet (Drawer)**로 제공한다.
    - **데스크톱:** 지도(좌측 9)와 정보 사이드바(우측 3)가 결합된 대시보드 형태를 유지한다.
- **[F-1.2] 발전소 마커:** 전국 발전소(석탄, LNG, 원자력 등) 및 터미널 위치를 핀으로 표시하며, 연료원별 색상을 구분한다.
- **[F-1.3] 오버레이 정보:** 핀 클릭 시 모바일에서는 Drawer, 데스크톱에서는 사이드바/오버레이를 통해 상세 정보를 표시한다.

#### 4.2. 기후시민 유형 테스트 (신규)
- **[F-2.1] 참여형 콘텐츠:** MBTI 형식의 심리 테스트를 통해 사용자의 기후 행동 유형을 분석한다.
- **[F-2.2] 결과 공유:** 16가지 유형별 캐릭터와 설명을 제공하며, SNS 공유 기능을 지원한다.
- **[F-2.3] 맞춤형 제안:** 테스트 결과에 따라 사용자에게 적합한 기후 행동 가이드를 제시한다.

#### 4.3. 뉴스-지도 연계 시스템
- **[F-3.1] 뉴스 분류:** 발전소별, 지역별, 전국 뉴스로 자동/수동 분류한다.
- **[F-3.2] 지도 연계:** 지도에서 특정 지역/발전소 선택 시 관련 뉴스를 필터링하여 보여준다.
- **[F-3.3] 뉴스 아카이브:** 별도의 뉴스 페이지 및 Drawer를 통해 전체 뉴스 목록을 탐색할 수 있다.

#### 4.4. 관리 시스템
- **[F-4.1] 자동 수집:** Inoreader 웹훅을 통해 관련 뉴스를 실시간으로 수집한다.
- **[F-4.2] 큐레이션:** 관리자가 수집된 뉴스를 승인/거부하고, 정확한 위치 정보와 태그를 부여한다.

## 5. 기술 스택 및 시스템 아키텍처

- **프론트엔드:** **Next.js 15 (App Router)**, **React 19**
- **스타일링:** **Tailwind CSS v4**, **shadcn/ui**, **Vaul (Drawer)**
- **지도:** **Leaflet**, **React-Leaflet**
- **백엔드/DB:** **Supabase** (PostgreSQL, Auth, Realtime)
- **뉴스 수집:** **Inoreader API**
- **배포:** **Vercel**

## 6. 데이터 모델 (핵심)

- **`power_plants`**: 발전소 기본 정보 (위치, 용량, 연료원, 운영 상태 등)
- **`articles`**: 뉴스 기사 정보 (제목, 내용, 링크, 관련 발전소ID, 위치 정보, 승인 상태)
- **`profiles`**: 사용자 정보 및 권한 (관리자 구분)
- **`climate_test_results`**: (선택) 기후 테스트 결과 집계 데이터

## 7. 구현 상태 (Current Implementation Status)

### ✅ 완료 (Done)
- **모바일 퍼스트 리디자인:**
    - 메인 페이지 지도 전면 배치 및 Bottom Sheet (Vaul) 도입.
    - 모바일 전용 하단 FAB (통계, 필터, 뉴스) 구현.
    - 반응형 Navigation Header 및 Global Footer (지도 페이지 제외) 적용.
- **기후시민 유형 테스트:**
    - MBTI 로직 기반 테스트 페이지 및 결과 페이지 구현.
    - 카카오톡/링크 공유 기능 연동.
- **지도 시스템:**
    - 전국 발전소/터미널 데이터 시각화 및 클러스터링.
    - 연료원별 컬러 코딩 마커 시스템.
- **뉴스 시스템:**
    - Inoreader 연동 자동 수집 파이프라인 구축.
    - 관리자 뉴스 승인/매핑 시스템.
    - 사용자단 뉴스 필터링 및 검색 기능.
- **페이지 최적화:**
    - 소개 페이지(/about), 뉴스 페이지(/news) 모바일 가독성 개선.
    - 선언 페이지(/declaration) 구현.

### 🚧 진행 중 (In Progress)
- **상세 콘텐츠 보강:** 발전소별 상세 정보 데이터 보완.
- **공유 기능 강화:** OG 이미지 동적 생성 등 소셜 공유 경험 고도화.
- **성능 최적화:** 대량의 마커 렌더링 최적화 및 초기 로딩 속도 개선.

## 8. 향후 계획 (Future Considerations)
- **사용자 커뮤니티:** 댓글 및 의견 남기기 기능.
- **알림 서비스:** 관심 지역/발전소 신규 뉴스 알림.
- **데이터 시각화 강화:** 연도별 탄소 배출량 추이 등 심층 데이터 제공.

## 부록: 기술 상세 명세 (Technical Appendix)

### 9. 데이터베이스 스키마 초안 (Database Schema)

Supabase (PostgreSQL) 기준 초기 스키마 설계안입니다.

```sql
-- 1. Power Plants (발전소 정보)
CREATE TABLE power_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  capacity_mw NUMERIC,           -- 발전 용량
  status TEXT,                   -- 운영중, 건설중 등
  fuel_type TEXT NOT NULL,       -- 석탄, LNG, 원자력 등
  operator TEXT,                 -- 운영사
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Articles (뉴스 기사)
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  url TEXT NOT NULL UNIQUE,      -- 원문 링크 (중복 방지)
  published_at TIMESTAMPTZ,      -- 기사 발행일
  thumbnail_url TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  
  -- 연관 관계
  power_plant_id UUID REFERENCES power_plants(id),
  
  -- 위치 정보 (지역 뉴스일 경우)
  location_type TEXT,            -- national, regional, plant
  latitude DOUBLE PRECISION,     -- 뉴스 관련 위치
  longitude DOUBLE PRECISION
);

-- 3. Climate Test Results (기후시민 테스트 결과 집계)
CREATE TABLE climate_test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,      -- 사용자 세션 (익명)
  mbti_type VARCHAR(4) NOT NULL, -- ENFP, ISTJ 등
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 10. 디자인 시스템 (Design System)

`tailwind.config.ts` 및 `globals.css` 기반 핵심 스타일 토큰입니다.

**🎨 컬러 팔레트 (Color Palette)**
- **Primary (Blue/Slate)**: 신뢰감을 주는 딥 블루/슬레이트 계열
  - Background: `#f8fafc` (Slate-50)
  - Text: `#0f172a` (Slate-900)
- **Accent (Fuel Types)**: 발전원별 구분 색상
  - ⚫ **석탄**: `bg-gray-900` (#111827)
  - 🔴 **LNG**: `bg-red-600` (#dc2626)
  - 🟣 **원자력**: `bg-purple-600` (#9333ea)

**🔤 타이포그래피 (Typography)**
- 기본 폰트: `Inter`, `Pretendard` 등 시스템 산세리프 우선 적용.
- 가독성: 모바일에서의 가독성을 위해 `break-words`, `keep-all` 등 줄바꿈 최적화 적용.

### 11. 초기 데이터 구축 전략 (Data Strategy)

1.  **발전소 데이터**:
    -   공공데이터포털(EPSIS)의 발전소 현황 데이터를 CSV로 확보.
    -   초기 `seed.ts` 스크립트를 통해 DB에 일괄 등록 (약 100~200개소).
2.  **기후시민 테스트 데이터**:
    -   MBTI 로직(질문 20개, 결과 16개)은 `src/data/` 내 정적 파일(`climateQuestions.ts`, `climateResults.ts`)로 관리하여 DB 조회 비용 절감.
3.  **뉴스 데이터**:
    -   초기에는 관리자가 주요 키워드(LNG, 석탄, 발전소)로 검색된 기사를 수동 큐레이션하여 DB에 등록.
    -   이후 Inoreader API 연동으로 자동화 전환.