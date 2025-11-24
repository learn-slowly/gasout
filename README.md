# 🗺️ GasOut - 전국 발전소 현황 및 뉴스 통합 플랫폼

전국 발전소 현황과 관련 뉴스를 지도 중심으로 통합 제공하는 온라인 플랫폼입니다.

## 🚀 주요 기능

### 🗺️ 지도 중심 인터페이스
- **전국 발전소 지도**: Leaflet 기반 인터랙티브 지도
- **연료별 마커 색상**: 석탄(검정), LNG(빨강), 원자력(보라), 기타화력(주황)
- **발전소 정보 패널**: 클릭 시 상세 정보와 연료별 색상 표시
- **반응형 레이아웃**: 모바일/데스크톱 최적화

### 🔥 LNG 가스 인프라 지도
- **LNG 발전소 지도**: 복합발전 및 열병합발전소 전용 지도 페이지
  - 155개 LNG 가스발전소 정보 (김원이 국회의원실 제공)
  - 유형별(복합발전/열병합발전), 상태별(운영/건설/계획) 필터링
  - 총 용량, 발전소 수, 지역별 통계 실시간 표시
- **LNG 인프라 통합 지도**: 발전소 + 터미널 통합 지도 ⭐ 신규
  - 267개 시설 통합 (발전소 155개 + 터미널 112개)
  - 마커 클러스터링 및 시설 유형별 색상 구분
  - 발전소/터미널 개별 필터링
  - 실시간 통계 대시보드

### 📰 뉴스 통합 시스템
- **자동 뉴스 수집**: Inoreader 웹훅을 통한 실시간 뉴스 수집
- **뉴스 분류**: 전국/지역/발전소 뉴스 자동 분류
- **뉴스 패널**: 필터링 및 검색 기능
- **HTML 엔티티 디코딩**: 뉴스 제목/내용 깨짐 현상 해결
- **뉴스 관리**: 관리자 승인/거부, 검색, 필터링, 편집 기능
- **발전소-뉴스 연계**: 발전소별 뉴스 연결 기능 (GT/ST 그룹화 지원)

### 🔐 관리자 시스템
- **뉴스 관리**: 기사 승인/거부, 분류, 편집 기능, 검색 및 필터링
- **통계 대시보드**: 발전소 현황 및 뉴스 현황 실시간 표시
- **사용자 인증**: Supabase Auth 기반 보안 시스템
- **사용자 관리**: 사용자 목록 조회 및 역할 관리
- **데이터 관리**: 발전소/터미널 데이터 업로드 및 좌표 geocoding

### 🌍 기후시민 MBTI 테스트 ⭐ 신규
- **MBTI 스타일 성향 테스트**: 20개 질문으로 16가지 기후행동 유형 진단
- **LNG 팩트 통합**: 질문 중간에 LNG 발전소 관련 정보 제공
- **맞춤형 결과**: 유형별 특징, 강점, 추천 기후행동 제시
- **기후시민 선언**: 테스트 완료 후 기후시민 선언 참여 유도
- **공유 기능**: 결과를 SNS에 공유하여 확산

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
│   ├── gas-plants/        # LNG 가스발전소 전용 페이지
│   ├── climate-test/      # 기후시민 MBTI 테스트 ⭐ 신규
│   ├── admin/             # 관리자 페이지
│   └── api/               # API 라우트
│       ├── gas-plants/    # LNG 가스발전소 API
│       └── climate-test/   # 기후 테스트 API ⭐ 신규
├── src/
│   ├── components/        # React 컴포넌트
│   │   ├── map/          # 지도 관련 컴포넌트
│   │   ├── gas/          # LNG 가스발전소 컴포넌트
│   │   └── ui/            # UI 컴포넌트
│   ├── lib/               # 유틸리티 및 설정
│   ├── types/             # TypeScript 타입 정의
│   └── data/              # 테스트 데이터 (질문, 결과) ⭐ 신규
├── data/                   # 데이터 파일
│   └── gas_plants_*.json  # LNG 가스발전소 데이터
└── supabase/              # 데이터베이스 스키마
    ├── gas_plants_schema.sql  # LNG 가스발전소 테이블 스키마
    └── climate_mbti_schema.sql  # 기후 테스트 스키마 ⭐ 신규
```

## 🌐 배포

- **프로덕션 URL**: [https://gasout.vercel.app](https://gasout.vercel.app)
- **자동 배포**: GitHub 연동으로 자동 배포
- **환경**: Vercel 플랫폼

## 📊 데이터베이스

- **발전소 데이터**: 615개 발전소 정보
- **LNG 가스발전소 데이터**: 155개 가스발전소 정보 (복합발전 103개, 열병합발전 52개)
- **LNG 터미널 데이터**: 112개 터미널 정보 (가스공사 87개, 민간 25개)
- **통합 시설 뷰**: 발전소 + 터미널 통합 조회 뷰
- **뉴스 데이터**: Inoreader를 통한 자동 수집 및 관리자 승인 시스템
- **사용자 데이터**: Supabase Auth 기반

## 🌍 기후시민 MBTI 테스트 설정

### 1. 데이터베이스 스키마 생성

Supabase SQL Editor에서 다음 스크립트를 실행:

```sql
-- web/supabase/climate_mbti_schema.sql 실행
```

이 스크립트는 다음 테이블을 생성합니다:
- `climate_test_responses`: 테스트 응답 저장
- `climate_declarations`: 기후시민 선언 저장

### 2. 접근 방법

- **테스트 시작**: `/climate-test`
- **테스트 진행**: `/climate-test/take`
- **결과 확인**: `/climate-test/result?type={MBTI_TYPE}`
- **기후시민 선언**: `/climate-test/declare`

### 3. 기능

- 20개 질문으로 16가지 MBTI 유형 진단
- 질문 중간에 LNG 팩트 제공 (4, 9, 14, 19번 질문 후)
- 유형별 맞춤형 결과 및 추천 기후행동
- 기후시민 선언 참여 유도
- 결과 공유 기능 (링크 복사, SNS 공유)

## 🔥 LNG 가스 인프라 데이터 설정

### 1. Supabase 테이블 생성

Supabase SQL Editor에서 다음 스크립트를 순서대로 실행:

```sql
-- 1. 발전소 테이블
-- web/supabase/gas_plants_schema.sql 실행

-- 2. 터미널 테이블 (신규)
-- web/supabase/gas_terminals_schema.sql 실행
```

### 2. 데이터 업로드

**발전소 데이터 업로드:**

```bash
# API 엔드포인트 사용
curl -X POST http://localhost:3000/api/gas-plants/upload

# 또는 페이지에서 "데이터 업로드" 버튼 클릭
```

**터미널 데이터 업로드 (신규):**

```bash
# API 엔드포인트 사용
curl -X POST http://localhost:3000/api/gas-terminals/upload
```

**Python 스크립트 사용 (선택사항):**

```bash
export SUPABASE_URL='https://xxxxx.supabase.co'
export SUPABASE_KEY='your-service-role-key'
python gas-plants-map-final/scripts/upload_all_to_supabase.py
```

### 3. 데이터 출처

- **제공**: 김원이 국회의원실
- **관리**: 화석연료를 넘어서(Korea Beyond Fossil Fuel)
- **최종 업데이트**: 2025-08-30
- **데이터 규모**: 발전소 155개 + 터미널 112개 = 총 267개 시설

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
