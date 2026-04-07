# GitHub Secrets 설정 가이드

GitHub Actions 워크플로우 실행에 필요한 secrets 목록.

## 설정 위치

GitHub 리포지토리 → Settings → Secrets and variables → Actions → New repository secret

## 필수 Secrets

### Notion

| Secret | 설명 | 확인 방법 |
|--------|------|----------|
| `NOTION_TOKEN` | Notion API 키 | [notion.so/my-integrations](https://www.notion.so/my-integrations) → Internal integration → Secret |
| `NOTION_DATABASE_ID` | 대상 DB ID | 노션 DB 페이지 URL에서 추출: `notion.so/{workspace}/{DATABASE_ID}?v=...` |

### Vercel

| Secret | 설명 | 확인 방법 |
|--------|------|----------|
| `VERCEL_TOKEN` | Vercel API 토큰 | [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create Token |
| `VERCEL_ORG_ID` | Vercel 조직/계정 ID | `npx vercel link` 실행 후 `.vercel/project.json`의 `orgId` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | 같은 파일의 `projectId` |

## Vercel 프로젝트 연결 (최초 1회)

```bash
cd lookbook
npx vercel link
```

프롬프트에 따라 프로젝트를 연결하면 `.vercel/project.json`이 생성된다.
해당 파일에서 `orgId`와 `projectId`를 복사하여 GitHub Secrets에 등록.
