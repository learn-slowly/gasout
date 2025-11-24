# Supabase 데이터베이스 설정 가이드

## 기후시민 MBTI 테스트 통계 기능 구현

이 가이드는 기후시민 MBTI 테스트 결과를 Supabase에 저장하고 통계를 표시하는 기능을 설정하는 방법을 안내합니다.

---

## 1. Supabase 프로젝트 확인

### 1.1 Supabase 접속
1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 (이미 생성된 프로젝트가 있는 경우)

### 1.2 프로젝트가 없는 경우
1. **New Project** 클릭
2. 프로젝트 정보 입력:
   - **Name**: `gasout` (또는 원하는 이름)
   - **Database Password**: 강력한 비밀번호 (저장해두세요!)
   - **Region**: Northeast Asia (Seoul) 또는 가까운 지역
3. **Create new project** 클릭 (약 2분 소요)

---

## 2. 데이터베이스 테이블 생성

### 2.1 SQL Editor 열기
1. 좌측 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭

### 2.2 스키마 SQL 실행
아래 SQL을 복사하여 SQL Editor에 붙여넣고 **Run** 버튼 클릭:

```sql
-- 기후시민 MBTI 테스트 응답 테이블
CREATE TABLE IF NOT EXISTS public.climate_test_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    result_type VARCHAR(4) NOT NULL, -- ENFP, ISTJ 등
    answers JSONB NOT NULL, -- 20개 질문 응답
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    shared BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_climate_result_type ON public.climate_test_responses(result_type);
CREATE INDEX IF NOT EXISTS idx_climate_created_at ON public.climate_test_responses(created_at);
CREATE INDEX IF NOT EXISTS idx_climate_session_id ON public.climate_test_responses(session_id);

-- 기후시민 선언 테이블
CREATE TABLE IF NOT EXISTS public.climate_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_response_id UUID REFERENCES public.climate_test_responses(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    region VARCHAR(50), -- 시/군 정보
    phone VARCHAR(20),
    consent_privacy BOOLEAN NOT NULL,
    consent_marketing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_climate_email ON public.climate_declarations(email);
CREATE INDEX IF NOT EXISTS idx_climate_region ON public.climate_declarations(region);
CREATE INDEX IF NOT EXISTS idx_climate_test_response ON public.climate_declarations(test_response_id);
CREATE INDEX IF NOT EXISTS idx_climate_session_id ON public.climate_declarations(session_id);

-- RLS 정책 설정
ALTER TABLE public.climate_test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.climate_declarations ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (통계용)
DROP POLICY IF EXISTS climate_test_responses_read_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_read_public ON public.climate_test_responses
    FOR SELECT
    USING (true);

-- 공개 쓰기 정책 (테스트 응답 저장)
DROP POLICY IF EXISTS climate_test_responses_insert_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_insert_public ON public.climate_test_responses
    FOR INSERT
    WITH CHECK (true);

-- 공개 업데이트 정책 (공유 상태 업데이트)
DROP POLICY IF EXISTS climate_test_responses_update_public ON public.climate_test_responses;
CREATE POLICY climate_test_responses_update_public ON public.climate_test_responses
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 기후시민 선언 공개 쓰기 정책
DROP POLICY IF EXISTS climate_declarations_insert_public ON public.climate_declarations;
CREATE POLICY climate_declarations_insert_public ON public.climate_declarations
    FOR INSERT
    WITH CHECK (true);

-- 기후시민 선언 공개 읽기 정책 (통계용)
DROP POLICY IF EXISTS climate_declarations_read_public ON public.climate_declarations;
CREATE POLICY climate_declarations_read_public ON public.climate_declarations
    FOR SELECT
    USING (true);
```

### 2.3 실행 확인
- **Success. No rows returned** 메시지가 뜨면 성공!
- 에러가 발생하면 메시지를 확인하고 수정

---

## 3. 테이블 확인

### 3.1 Table Editor에서 확인
1. 좌측 메뉴에서 **Table Editor** 클릭
2. 다음 테이블이 생성되었는지 확인:
   - ✅ `climate_test_responses` (테스트 응답)
   - ✅ `climate_declarations` (기후시민 선언)

### 3.2 테이블 구조 확인
**climate_test_responses** 테이블:
- `id`: UUID (Primary Key)
- `session_id`: 고유 세션 ID
- `result_type`: MBTI 유형 (ENFP, ISTJ 등)
- `answers`: 20개 질문 응답 (JSON)
- `utm_source`, `utm_medium`, `utm_campaign`: 유입 경로 추적
- `created_at`, `completed_at`: 생성/완료 시간
- `shared`: 공유 여부

**climate_declarations** 테이블:
- `id`: UUID (Primary Key)
- `test_response_id`: 테스트 응답 ID (외래키)
- `session_id`: 세션 ID
- `name`: 이름
- `email`: 이메일
- `region`: 지역
- `phone`: 전화번호 (선택)
- `consent_privacy`: 개인정보 동의
- `consent_marketing`: 마케팅 동의
- `created_at`: 생성 시간

---

## 4. 환경변수 설정

### 4.1 API 키 확인
1. Supabase Dashboard에서 **Project Settings** (⚙️) 클릭
2. **API** 메뉴 클릭
3. 다음 정보 복사:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (긴 토큰)

### 4.2 환경변수 추가
`/web/.env.local` 파일에 다음 내용 추가 (없다면 생성):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_입력
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_public_key_입력

# Kakao (이미 설정했다면 그대로 유지)
NEXT_PUBLIC_KAKAO_APP_KEY=여기에_카카오_JavaScript_키_입력
```

**예시:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_KAKAO_APP_KEY=97ac98a9d0c4772eda33283870671745
```

### 4.3 개발 서버 재시작
환경변수를 추가했다면 개발 서버를 재시작해야 합니다:

```bash
# Ctrl+C로 서버 종료 후
cd web
npm run dev
```

---

## 5. 기능 테스트

### 5.1 테스트 진행
1. 브라우저에서 `http://localhost:3000/declaration` 접속
2. 기후시민 MBTI 테스트 시작
3. 20개 질문 모두 답변
4. 결과 페이지에서 통계 확인:
   - ✅ "테스트 완료" 숫자
   - ✅ "나와 같은 유형" 숫자 및 비율
   - ✅ "기후시민 선언" 숫자

### 5.2 데이터 확인
Supabase Dashboard > **Table Editor** > `climate_test_responses`에서:
- 방금 완료한 테스트 데이터가 저장되었는지 확인
- `result_type`이 올바르게 저장되었는지 확인

### 5.3 통계 API 테스트
브라우저에서 직접 API 호출:
```
http://localhost:3000/api/climate-test/stats?type=ENFP
```

응답 예시:
```json
{
  "totalTests": 15,
  "totalDeclarations": 8,
  "sameTypeCount": 3,
  "sameTypePercentage": 20,
  "topTypes": [...]
}
```

---

## 6. 문제 해결

### 6.1 "Failed to save test response" 에러
**원인**: 
- Supabase URL이나 키가 잘못 입력됨
- 테이블이 생성되지 않음
- RLS 정책 문제

**해결 방법**:
1. `.env.local` 파일의 URL과 키 다시 확인
2. Supabase SQL Editor에서 스키마 SQL 다시 실행
3. 개발 서버 재시작

### 6.2 통계가 표시되지 않음
**원인**:
- API 호출 실패
- 데이터가 아직 저장되지 않음

**해결 방법**:
1. 브라우저 개발자 도구 (F12) > **Network** 탭에서 `/api/climate-test/stats` 요청 확인
2. 에러 메시지 확인
3. Supabase Table Editor에서 실제 데이터 있는지 확인

### 6.3 RLS 정책 에러
**원인**: Row Level Security 정책이 제대로 설정되지 않음

**해결 방법**:
1. Supabase Dashboard > **Authentication** > **Policies**
2. `climate_test_responses`와 `climate_declarations` 테이블의 정책 확인
3. 필요시 SQL Editor에서 정책 SQL 다시 실행

---

## 7. 배포 환경 설정

### 7.1 Vercel 환경변수
Vercel에 배포할 때는 환경변수를 추가해야 합니다:

1. Vercel Dashboard > 프로젝트 선택
2. **Settings** > **Environment Variables**
3. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_KAKAO_APP_KEY`
4. Environment: **Production**, **Preview**, **Development** 모두 선택
5. **Save** 후 재배포

### 7.2 Supabase URL Allowlist
Supabase에서 운영 도메인 허용:

1. Supabase Dashboard > **Project Settings** > **API**
2. **URL Configuration** 섹션에서 운영 도메인 추가
   - 예: `https://gasout.vercel.app`

---

## 8. 데이터 관리

### 8.1 통계 조회
SQL Editor에서 직접 쿼리:

```sql
-- 전체 테스트 완료 수
SELECT COUNT(*) FROM climate_test_responses;

-- 유형별 분포
SELECT result_type, COUNT(*) as count 
FROM climate_test_responses 
GROUP BY result_type 
ORDER BY count DESC;

-- 기후시민 선언 수
SELECT COUNT(*) FROM climate_declarations;

-- 지역별 선언자 수
SELECT region, COUNT(*) as count 
FROM climate_declarations 
WHERE region IS NOT NULL
GROUP BY region 
ORDER BY count DESC;
```

### 8.2 데이터 백업
1. Supabase Dashboard > **Database** > **Backups**
2. 정기적으로 백업 확인
3. 필요시 수동 백업 생성

### 8.3 데이터 내보내기
1. Table Editor에서 테이블 선택
2. 우측 상단 **⋯** 메뉴 > **Export to CSV**

---

## 9. 보안 고려사항

### ✅ 안전한 설정
- ✅ RLS(Row Level Security) 활성화됨
- ✅ anon key 사용 (공개 가능)
- ✅ 읽기/쓰기 정책 설정됨

### ⚠️ 주의사항
- ❌ **Service Role Key**는 절대 프론트엔드에 노출하지 마세요!
- ❌ `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함됨)
- ✅ 개인정보(이메일, 전화번호)는 암호화 저장 고려

---

## 10. 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

설정 완료 후 기후시민 MBTI 테스트의 모든 통계 기능이 정상 작동합니다! 🎉

