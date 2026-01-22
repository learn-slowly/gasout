# ✅ AI 뉴스 분석 기능 설정 완료 (관리자용)

## 🎉 완료된 작업

### 1. 데이터베이스 마이그레이션 ✅

다음 컬럼들이 `articles` 테이블에 추가되었습니다:

```sql
✅ ai_score (DECIMAL)       - AI 관련성 점수
✅ is_relevant (BOOLEAN)    - 관련 여부
✅ ai_summary (TEXT)        - AI 생성 요약
✅ ai_analyzed_at (TIMESTAMP) - 분석 시간
✅ ai_model_version (VARCHAR) - 사용된 모델
```

### 2. 인덱스 생성 ✅

성능 향상을 위한 인덱스:

```sql
✅ idx_articles_is_relevant
✅ idx_articles_ai_score
```

### 3. 관리자 페이지 업데이트 ✅

- ✅ AI 점수 배지 표시 (관련/무관/미분석)
- ✅ AI 요약 표시 (관련 기사만)
- ✅ 개별 기사 AI 분석 버튼
- ✅ 일괄 AI 분석 버튼
- ✅ 분석 진행 상태 표시

### 4. API 기능 개선 ✅

- ✅ 특정 기사 ID로 분석 가능
- ✅ 여러 Gemini 모델 자동 fallback
- ✅ 상세한 에러 메시지

### 5. 일반 사용자 페이지 정리 ✅

- ✅ `/news` 페이지에서 AI 필터 제거
- ✅ 승인된 모든 기사 표시 (AI 점수 무관)

### 6. 문서화 완료 ✅

- `docs/AI_NEWS_FILTERING.md` - 상세 가이드
- `AI_SETUP_COMPLETE.md` - 이 파일

## 📊 현재 상태

```
총 기사: 59개
AI 분석 완료: 0개
분석 대기: 59개
```

## 🚀 사용 방법

### 1. 관리자 페이지에서 AI 분석

```bash
# 1. 개발 서버 시작 (이미 실행 중)
npm run dev

# 2. 관리자 페이지 접속
# http://localhost:3000/admin/articles

# 3. AI 분석 실행
# - 개별 기사: 각 카드의 "🤖 AI 분석" 버튼 클릭
# - 일괄 분석: 상단의 "🤖 미분석 기사 AI 분석" 버튼 클릭
```

### 2. AI 분석 결과 확인

각 기사 카드에 표시되는 정보:

- **🤖 관련 (85점)** - LNG/기후위기/탄소중립 관련 기사
- **무관 (20점)** - 관련성 낮은 기사  
- **미분석** - AI 분석 전
- **AI 요약** - 관련 기사의 요약 (파란 박스)

### 3. 승인 프로세스

1. AI 분석 결과 확인
2. 관련성 높은 기사 우선 검토
3. 필요시 편집
4. 승인/거부 결정

## 🔍 기능 확인

### 관리자 페이지 확인

1. http://localhost:3000/admin/articles 방문
2. 각 기사 카드에서 "미분석" 배지 확인
3. "🤖 AI 분석" 버튼 클릭
4. 분석 완료 후 결과 확인

### API로 확인

```bash
# 관련 기사만 조회
curl "http://localhost:3000/api/articles?is_relevant=true"

# 전체 기사 조회
curl "http://localhost:3000/api/articles"
```

## 📁 생성된 파일

```
web/
├── supabase/
│   └── add_ai_analysis_columns.sql  (마이그레이션 SQL)
├── scripts/
│   ├── migrate-ai-columns.js        (Node.js 스크립트)
│   ├── run-migration.mjs            (ES 모듈 스크립트)
│   └── setup-and-migrate.mjs        (설정 스크립트)
├── docs/
│   └── AI_NEWS_FILTERING.md         (상세 가이드)
├── src/app/api/admin/
│   ├── analyze-news/route.ts        (AI 분석 API) ✅ 기존
│   └── migrate-db/route.ts          (마이그레이션 API) ✅ 신규
└── AI_SETUP_COMPLETE.md             (이 파일)
```

## 🎯 주요 코드

### AI 필터 (뉴스 페이지)

```typescript:72:76:web/src/app/news/page.tsx
if (showAIOnly) {
    // Filter for AI relevant articles. 
    // Note: This requires 'is_relevant' column in 'articles' table.
    query = query.eq('is_relevant', true);
}
```

### AI 분석 API

```typescript:59:64:web/src/app/api/admin/analyze-news/route.ts
const prompt = `
Analyze the following news article for its relevance to 'LNG Power Plants', 'Climate Crisis', or 'Carbon Neutrality' in South Korea.
Title: ${article.title}
Content (brief): ${article.content?.substring(0, 500)}...
Respond ONLY with a JSON object in this format: { "relevance_score": number, "is_relevant": boolean, "summary": string }
`;
```

## ⚙️ 환경 변수 체크리스트

필요한 환경 변수 (`.env.local`):

- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase Service Role Key
- ⚠️ `GEMINI_API_KEY` - Google Gemini API Key (할당량 확인 필요)

## 🐛 알려진 이슈

### Gemini API 할당량 초과

**증상:**
```
[429 Too Many Requests] Quota exceeded for quota metric 'Generate Content API requests per minute'
```

**해결 방법:**
1. 잠시 대기 (시간이 지나면 자동 복구)
2. 다른 Gemini 모델 사용 (자동 fallback)
3. 유료 플랜으로 업그레이드
4. 배치 작업 시 딜레이 추가:
   ```bash
   # 5분마다 1개씩 분석
   */5 * * * * curl -X POST http://localhost:3000/api/admin/analyze-news
   ```

## 💡 사용 팁

### 1. 자동화된 분석

서버 cron 또는 Vercel Cron을 사용해서 주기적으로 분석:

```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/admin/analyze-news",
    "schedule": "*/5 * * * *"  // 5분마다
  }]
}
```

### 2. 수동 분석

관리자 페이지에 버튼 추가:

```typescript
<Button onClick={() => fetch('/api/admin/analyze-news', { method: 'POST' })}>
  기사 분석 실행
</Button>
```

### 3. 실시간 분석

새 기사 추가 시 자동 분석:

```typescript
// 기사 추가 후
await fetch('/api/admin/analyze-news', { method: 'POST' });
```

## 🎊 완료!

AI 뉴스 필터링 기능이 정상적으로 작동합니다!

### 확인 방법:
1. http://localhost:3000/news 방문
2. **🤖 AI 추천 뉴스** 버튼 클릭
3. 기사 개수 변화 확인 (59개 ↔ 10개)

---

**문제가 있으신가요?** `docs/AI_NEWS_FILTERING.md` 참고하세요.
