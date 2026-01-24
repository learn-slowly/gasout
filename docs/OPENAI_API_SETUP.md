# OpenAI API 설정 가이드

이 문서는 뉴스 기사 AI 분석 기능을 위한 OpenAI API 설정 방법을 안내합니다.

## 📋 목차

1. [OpenAI API 키 발급](#1-openai-api-키-발급)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [비용 관리](#3-비용-관리)
4. [문제 해결](#4-문제-해결)

---

## 1. OpenAI API 키 발급

### 1.1 OpenAI 계정 생성

1. https://platform.openai.com/signup 접속
2. 이메일 또는 Google 계정으로 가입
3. 이메일 인증 완료

### 1.2 API 키 생성

1. https://platform.openai.com/api-keys 접속
2. **"Create new secret key"** 버튼 클릭
3. 키 이름 입력 (예: `gasout-news-analyzer`)
4. **API 키 복사** (⚠️ 한 번만 표시되므로 반드시 저장!)
5. 안전한 곳에 보관

### 1.3 결제 정보 등록

1. https://platform.openai.com/settings/organization/billing/overview 접속
2. **"Add payment method"** 클릭
3. 신용카드 정보 입력
4. 결제 한도 설정 (권장: $10~$50)

---

## 2. 환경 변수 설정

### 2.1 로컬 개발 환경

`.env.local` 파일에 추가:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.2 Vercel 배포 환경

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Settings > Environment Variables** 메뉴
4. 새 환경 변수 추가:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-proj-xxxxxxxx...` (발급받은 API 키)
   - **Environment**: Production, Preview, Development 모두 선택
5. **Save** 클릭
6. 프로젝트 재배포

---

## 3. 비용 관리

### 3.1 예상 비용 (GPT-4o-mini 기준)

| 사용량 | 예상 비용 |
|--------|-----------|
| 기사 100개 분석 | 약 $0.10~0.20 (130~260원) |
| 기사 1,000개 분석 | 약 $1~2 (1,300~2,600원) |
| 기사 10,000개 분석 | 약 $10~20 (13,000~26,000원) |

### 3.2 비용 절감 팁

1. **배치 처리**: 한 번에 여러 기사를 분석하지 말고 필요한 만큼만
2. **내용 제한**: 기사 내용을 500자로 제한 (현재 설정됨)
3. **Temperature 낮추기**: 0.3으로 설정하여 일관성 향상 및 토큰 절약

### 3.3 사용량 모니터링

1. https://platform.openai.com/usage 접속
2. 일별/월별 사용량 확인
3. 예산 초과 시 알림 설정

### 3.4 비용 한도 설정

1. https://platform.openai.com/settings/organization/limits 접속
2. **"Usage limits"** 설정
3. 월별 최대 지출 금액 설정 (권장: $10~$50)

---

## 4. 문제 해결

### 4.1 "API key is missing" 오류

**원인**: 환경 변수가 설정되지 않음

**해결**:
1. Vercel 환경 변수 확인
2. 프로젝트 재배포
3. 로컬 환경이면 `.env.local` 파일 확인

### 4.2 "Insufficient quota" 오류

**원인**: 결제 정보 미등록 또는 크레딧 부족

**해결**:
1. https://platform.openai.com/settings/organization/billing 접속
2. 결제 정보 등록 또는 크레딧 충전

### 4.3 "Rate limit exceeded" 오류

**원인**: 분당 요청 수 초과 (무료 티어: 3 RPM)

**해결**:
1. 유료 플랜으로 업그레이드 (Tier 1: 500 RPM)
2. 요청 간격 조절

### 4.4 응답 형식 오류

**원인**: JSON 파싱 실패

**해결**:
- 이미 `response_format: { type: "json_object" }`로 설정되어 있어 자동으로 JSON 형식 보장

---

## 5. API 모델 정보

### 5.1 사용 중인 모델

**GPT-4o-mini**
- 빠르고 저렴한 모델
- 한국어 지원 우수
- 입력: $0.15 / 1M 토큰
- 출력: $0.60 / 1M 토큰

### 5.2 다른 모델로 변경

`/api/admin/analyze-news/route.ts` 파일에서:

```typescript
model: "gpt-4o-mini"  // 다른 모델로 변경 가능
```

**사용 가능한 모델**:
- `gpt-4o-mini`: 가장 저렴하고 빠름 (권장)
- `gpt-4o`: 더 정확하지만 비쌈
- `gpt-4-turbo`: 가장 강력하지만 가장 비쌈

---

## 6. 보안 주의사항

### 6.1 API 키 보안

⚠️ **절대 하지 말아야 할 것**:
- Git에 API 키 커밋
- 클라이언트 코드에 API 키 노출
- 공개 저장소에 `.env` 파일 업로드

✅ **해야 할 것**:
- 환경 변수로만 관리
- `.gitignore`에 `.env*` 추가
- 주기적으로 API 키 갱신

### 6.2 API 키 재발급

키가 노출된 경우:
1. https://platform.openai.com/api-keys 접속
2. 노출된 키 삭제
3. 새 키 발급
4. 환경 변수 업데이트
5. 재배포

---

## 7. 참고 자료

- [OpenAI API 문서](https://platform.openai.com/docs)
- [가격 정보](https://openai.com/api/pricing/)
- [사용량 대시보드](https://platform.openai.com/usage)
- [커뮤니티 포럼](https://community.openai.com/)

---

## 8. 지원

문제가 발생하면:
1. 이 문서의 [문제 해결](#4-문제-해결) 섹션 확인
2. OpenAI 공식 문서 참조
3. GitHub Issues에 문의
