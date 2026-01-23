# 자동 정리 기능

## 개요

거부된 기사를 30일 후 자동으로 삭제하여 데이터베이스를 깨끗하게 유지합니다.

## 기능

### 1. 수동 삭제 (관리 페이지)

기사 관리 페이지 상단의 **"🗑️ 오래된 거부 기사 삭제 (30일 이상)"** 버튼을 클릭하면:

1. 거부된 지 30일이 지난 기사 수를 확인
2. 확인 메시지 표시
3. 사용자 승인 후 영구 삭제

### 2. API 엔드포인트

#### 삭제 대상 확인
```bash
GET /api/admin/cleanup-rejected
```

응답:
```json
{
  "success": true,
  "count": 150,
  "message": "150개의 거부된 기사가 삭제 대상입니다."
}
```

#### 삭제 실행
```bash
POST /api/admin/cleanup-rejected
```

응답:
```json
{
  "success": true,
  "deletedCount": 150,
  "message": "150개의 거부된 기사가 삭제되었습니다."
}
```

## 자동화 설정 (선택사항)

### GitHub Actions로 자동 실행

`.github/workflows/cleanup-rejected.yml` 파일 생성:

```yaml
name: Cleanup Old Rejected Articles

on:
  schedule:
    # 매일 오전 3시 (UTC 기준)
    - cron: '0 3 * * *'
  workflow_dispatch: # 수동 실행 가능

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup rejected articles
        run: |
          curl -X POST https://your-domain.vercel.app/api/admin/cleanup-rejected
```

### Vercel Cron Jobs (권장)

`vercel.json` 파일에 추가:

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup-rejected",
      "schedule": "0 3 * * *"
    }
  ]
}
```

이렇게 하면 매일 오전 3시에 자동으로 오래된 거부 기사가 삭제됩니다.

## 주의사항

⚠️ **삭제된 기사는 복구할 수 없습니다.**

- 삭제 전에 항상 확인 메시지가 표시됩니다
- 30일 기준은 `updated_at` 컬럼을 기준으로 합니다
- `status = 'rejected'`인 기사만 삭제됩니다

## 데이터베이스 함수 (선택사항)

Supabase SQL Editor에서 실행:

```sql
-- 수동으로 함수 실행
SELECT delete_old_rejected_articles();
```

함수는 `supabase/auto_delete_rejected_articles.sql` 파일에 정의되어 있습니다.
