# 🤖 Gemini API 설정 가이드

## ⚠️ 현재 상태: API 할당량 문제

현재 Gemini API 할당량이 0으로 설정되어 있어 AI 분석 기능을 사용할 수 없습니다.

## 🔍 문제 확인

에러 메시지:
```
quota_limit_value: "0"
Quota exceeded for quota metric 'Generate Content API requests per minute'
```

## 💡 해결 방법

### 1. API 키 상태 확인

1. **Google AI Studio 접속**
   - 🔗 https://aistudio.google.com/app/apikey

2. **현재 API 키 확인**
   - API 키가 활성화되어 있는지 확인
   - 프로젝트가 올바르게 설정되어 있는지 확인

3. **할당량 확인**
   - 🔗 https://aistudio.google.com/app/prompts
   - 좌측 메뉴에서 "Get API key" 클릭
   - 할당량 정보 확인

### 2. 새 API 키 발급

**방법 A: Google AI Studio (권장)**

1. https://aistudio.google.com/app/apikey 접속
2. "Create API key" 클릭
3. 프로젝트 선택 또는 새 프로젝트 생성
4. API 키 복사

**방법 B: Google Cloud Console**

1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성
3. "APIs & Services" > "Credentials" 이동
4. "Create Credentials" > "API key" 선택
5. Generative Language API 활성화

### 3. 환경 변수 업데이트

`.env.local` 파일에 새 API 키 추가:

```bash
GEMINI_API_KEY=your_new_api_key_here
```

### 4. 서버 재시작

```bash
npm run dev
```

## 📊 무료 티어 할당량

| 모델 | 무료 할당량 (RPM) | 일일 한도 |
|------|------------------|----------|
| gemini-1.5-flash | 15 RPM | 1,500 RPD |
| gemini-1.5-flash-8b | 15 RPM | 1,500 RPD |
| gemini-1.5-pro | 2 RPM | 50 RPD |

RPM = Requests Per Minute (분당 요청 수)
RPD = Requests Per Day (일일 요청 수)

## 🔧 현재 설정

프로젝트는 다음 모델을 순서대로 시도합니다:

1. `gemini-1.5-flash` (최우선)
2. `gemini-1.5-flash-8b` (경량 모델)
3. `gemini-1.5-pro` (Pro 모델)

## ⏰ 임시 해결책

AI 분석 없이도 관리자 페이지는 정상 작동합니다:

### 관리자 페이지 사용 (/admin/articles)

1. **기사 목록 확인**
   - 모든 기사가 "미분석" 배지로 표시됩니다

2. **수동 검토**
   - 기사 제목과 내용을 직접 읽고 판단
   - LNG/기후위기/탄소중립 관련성 확인

3. **승인/거부 결정**
   - AI 점수 없이도 승인/거부 가능
   - 편집 기능 사용 가능

4. **AI 분석 (할당량 복구 후)**
   - "🤖 AI 분석" 버튼으로 개별 분석
   - "🤖 미분석 기사 AI 분석" 버튼으로 일괄 분석

## 🎯 권장 사항

### 단기 (지금 당장)
- AI 분석 없이 수동으로 기사 검토 및 승인
- 관리자 페이지의 모든 기능은 정상 작동

### 중기 (할당량 복구 후)
- 새 API 키 발급
- 일일 할당량 내에서 AI 분석 사용
- 중요한 기사만 선택적으로 AI 분석

### 장기 (필요시)
- Google Cloud 유료 플랜 고려
- 더 높은 할당량 확보
- 자동화된 AI 분석 파이프라인 구축

## 📞 문제 해결

### API 키가 작동하지 않는 경우

1. **API 활성화 확인**
   ```bash
   # Google Cloud Console에서 확인
   # Generative Language API가 활성화되어 있는지 확인
   ```

2. **프로젝트 설정 확인**
   - API 키가 올바른 프로젝트에 연결되어 있는지 확인
   - 프로젝트에 결제 정보가 등록되어 있는지 확인 (무료 티어도 필요)

3. **환경 변수 확인**
   ```bash
   # .env.local 파일 확인
   cat .env.local | grep GEMINI_API_KEY
   ```

4. **서버 로그 확인**
   ```bash
   # 개발 서버 로그에서 에러 메시지 확인
   npm run dev
   ```

## 🔗 유용한 링크

- **Google AI Studio**: https://aistudio.google.com/
- **API 키 관리**: https://aistudio.google.com/app/apikey
- **Gemini API 문서**: https://ai.google.dev/docs
- **할당량 정보**: https://ai.google.dev/pricing
- **할당량 증가 요청**: https://cloud.google.com/docs/quotas/help/request_increase

## ✅ 체크리스트

할당량 문제 해결을 위한 체크리스트:

- [ ] Google AI Studio에서 API 키 상태 확인
- [ ] 새 API 키 발급 (필요시)
- [ ] `.env.local`에 API 키 업데이트
- [ ] 서버 재시작
- [ ] 브라우저 캐시 클리어 (Cmd+Shift+R)
- [ ] 관리자 페이지에서 AI 분석 버튼 테스트
- [ ] 할당량 모니터링 설정

---

**참고**: AI 분석은 선택적 기능입니다. 관리자가 직접 기사를 검토하고 승인하는 것이 기본 워크플로우입니다.
