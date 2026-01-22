# AI 뉴스 분석 기능 가이드 (관리자용)

## 📖 개요

이 프로젝트는 Google Gemini AI를 사용하여 뉴스 기사를 자동으로 분석하고 LNG 발전소, 기후 위기, 탄소 중립과 관련된 기사를 판별하여 관리자의 승인 작업을 돕는 기능을 제공합니다.

## 🎯 주요 기능

### 1. AI 자동 분석 (관리자용)
- **Google Gemini AI** 사용
- LNG 발전소, 기후 위기, 탄소 중립 관련성 판단
- 관련성 점수 (0-100) 자동 계산
- AI 생성 요약 제공
- 관리자가 기사 승인 시 참고 자료로 활용

### 2. 관리자 페이지 통합
- `/admin/articles` 페이지에서 AI 분석 결과 확인
- 각 기사별 AI 점수와 요약 표시
- 개별 기사 또는 일괄 AI 분석 가능
- 승인 여부 결정에 활용

## 🛠️ 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Gemini API Key (필수)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Keys (이미 설정되어 있어야 함)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 방문
2. 로그인 후 "Get API Key" 클릭
3. 생성된 API 키를 복사해서 `.env.local`에 추가

### 3. 데이터베이스 마이그레이션

데이터베이스에 필요한 컬럼들이 이미 추가되었습니다:

✅ `ai_score` - AI 관련성 점수 (0-100)
✅ `is_relevant` - 관련 여부 (true/false)
✅ `ai_summary` - AI 생성 요약
✅ `ai_analyzed_at` - 분석 시간
✅ `ai_model_version` - 사용된 AI 모델

## 📊 사용 방법

### 관리자 페이지에서 AI 분석

1. **개발 서버 시작**
```bash
npm run dev
```

2. **관리자 페이지 접속**
   - http://localhost:3000/admin/articles 방문
   - 관리자 로그인 필요

3. **개별 기사 분석**
   - 각 기사 카드에서 **🤖 AI 분석** 버튼 클릭
   - 분석 완료 후 자동으로 결과 표시

4. **일괄 분석**
   - 페이지 상단의 **🤖 미분석 기사 AI 분석** 버튼 클릭
   - 대기 중인 모든 미분석 기사를 순차적으로 분석

### AI 분석 결과 확인

각 기사 카드에 다음 정보가 표시됩니다:

- **🤖 관련 (85점)** - LNG/기후위기/탄소중립과 관련된 기사
- **무관 (20점)** - 관련성이 낮은 기사
- **미분석** - 아직 AI 분석이 되지 않은 기사
- **AI 요약** - 기사 내용에 대한 AI 생성 요약 (관련 기사인 경우)

### API를 통한 분석 (선택사항)

```bash
# 1. 다음 미분석 기사 1개 분석
curl -X POST http://localhost:3000/api/admin/analyze-news

# 2. 특정 기사 분석
curl -X POST http://localhost:3000/api/admin/analyze-news \
  -H "Content-Type: application/json" \
  -d '{"articleId": "기사ID"}'
```

**응답 예시:**
```json
{
  "success": true,
  "processed": 1,
  "failed": 0,
  "results": [
    {
      "id": 123,
      "model": "gemini-2.0-flash-lite",
      "relevance_score": 85.5,
      "is_relevant": true,
      "summary": "LNG 발전소 건설 관련 정책 변화에 대한 기사"
    }
  ]
}
```

## 🔧 API 엔드포인트

### POST `/api/admin/analyze-news`

새로운 기사를 AI로 분석합니다.

**특징:**
- 한 번에 1개의 기사 분석
- `ai_score`가 `NULL`인 기사만 선택
- 여러 Gemini 모델 자동 fallback

**지원 모델 (우선순위순):**
1. `gemini-2.0-flash-lite-preview-02-05` (최우선)
2. `gemini-2.0-flash-lite`
3. `gemini-2.0-flash`
4. `gemini-2.5-flash`
5. `gemini-2.0-flash-001`

## 📈 현재 통계

```bash
# 통계 확인 쿼리
SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN is_relevant = true THEN 1 END) as relevant,
  COUNT(CASE WHEN is_relevant IS NULL THEN 1 END) as pending
FROM articles 
WHERE status = 'approved';
```

## ⚠️ 주의사항

### 할당량 제한

Gemini API는 무료 티어에서 다음과 같은 제한이 있습니다:
- **분당 요청 수**: 지역별로 제한됨
- 할당량 초과 시 `429 Too Many Requests` 오류 발생

**해결 방법:**
1. 여러 모델 사용 (자동으로 fallback 처리됨)
2. 배치 작업 시 딜레이 추가
3. 필요시 유료 플랜으로 업그레이드

### 분석 자동화

```bash
# Cron 작업 예시 (5분마다 1개씩 분석)
*/5 * * * * curl -X POST http://localhost:3000/api/admin/analyze-news
```

## 🚀 배포 시 설정

### Vercel 환경 변수

프로젝트를 Vercel에 배포하는 경우:

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 변수 추가:
   - `GEMINI_API_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 🐛 문제 해결

### "Could not find column is_relevant"

**원인:** 데이터베이스에 AI 컬럼이 없음

**해결:**
```bash
node scripts/migrate-ai-columns.js
```

### "Quota exceeded"

**원인:** Gemini API 할당량 초과

**해결:**
- 잠시 기다렸다가 다시 시도
- 다른 모델 사용 (자동으로 fallback)
- API 키 업그레이드

### "GEMINI_API_KEY is missing"

**원인:** 환경 변수가 설정되지 않음

**해결:**
1. `.env.local` 파일 확인
2. `GEMINI_API_KEY=...` 추가
3. 서버 재시작

## 📚 참고 자료

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 환경 변수가 올바르게 설정되었는지
2. Supabase 데이터베이스에 필요한 컬럼이 있는지
3. Gemini API 할당량이 남아있는지
4. 서버 로그에 에러 메시지가 있는지

---

✅ **설정 완료!** 이제 AI가 자동으로 뉴스를 선별합니다.
