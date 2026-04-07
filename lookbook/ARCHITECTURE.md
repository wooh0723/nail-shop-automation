# 룩북 아키텍처

## 개요

시그니초 네일(5개 지점) 네일아트 온라인 룩북.  
노션에 업로드된 작업물을 정적 사이트로 서빙한다.

## 핵심 원칙

- **런타임 노션 API 호출 없음** — 빌드 타임에 데이터를 로컬에 저장
- **노션 이미지 로컬 저장 필수** — 노션 이미지 URL은 1시간 후 만료됨
- **`notion.databases.query` 사용** — `notion.dataSources.query` 사용 금지

## 데이터 흐름

```
노션 DB
  ↓ (GitHub Actions 스케줄 or 수동 트리거)
scripts/fetch-notion.ts
  ├── public/data/nailarts.json
  └── public/images/nail/{pageId}-{index}.jpg
  ↓
Next.js 정적 렌더링 (노션 API 호출 없음)
  ├── /          룩북 메인 그리드
  └── /art/[id]  아트 상세 페이지
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 노션 연동 | @notionhq/client (공식 SDK) |
| 배포 | Vercel |
| 자동화 | GitHub Actions |

## 디렉토리 구조

```
lookbook/
├── app/
│   ├── page.tsx              # 룩북 메인 그리드
│   └── art/[id]/page.tsx     # 아트 상세 페이지
├── scripts/
│   └── fetch-notion.ts       # 노션 데이터 fetch + 이미지 다운로드
├── public/
│   ├── data/nailarts.json    # fetch 결과 (git 제외)
│   └── images/nail/          # 다운로드된 이미지 (git 제외)
├── docs/
│   ├── FRONTEND.md
│   └── exec-plans/active/    # 현재 진행 중인 작업 명세
└── .github/workflows/        # GitHub Actions
```

## 노션 DB 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---------|------|------|
| 이름 | title | 아트명 |
| 테마 | select | 필터 기준 |
| 가격 | select | 39아트 / 59아트 / 79아트 |
| 시기 | select | 계절/시즌 |
| 제안자 | select | 담당 작업자 |
| 배포 | checkbox | true인 페이지만 fetch 대상 |
| (커버 이미지) | cover | 대표 이미지 |
| (본문 블록) | blocks | 상세 이미지, 재료, 구매 링크 |

## 환경변수

### 변수 목록

| 변수 | 설명 | 획득 방법 |
|------|------|-----------|
| `NOTION_TOKEN` | 노션 인테그레이션 토큰 | 노션 → 설정 → 연결 → 인테그레이션 생성 |
| `NOTION_DATABASE_ID` | 노션 DB ID | DB URL에서 추출 (`notion.so/{workspace}/{DATABASE_ID}?v=...`) |

### 로컬 개발

`.env.local` 파일에 설정 (git 제외됨):

```bash
NOTION_TOKEN=ntn_...
NOTION_DATABASE_ID=32957ddb2d67812883d7d1377e5b2406
```

`scripts/fetch-notion.ts`에서 `dotenv`로 자동 로드됨.

### CI/CD (GitHub Actions)

GitHub 리포지토리 → Settings → Secrets and variables → Actions에 동일한 변수 등록.  
Vercel 배포 자동화를 위해 추가로 필요한 시크릿:

| 변수 | 설명 |
|------|------|
| `VERCEL_TOKEN` | Vercel 계정 토큰 |
| `VERCEL_ORG_ID` | Vercel 팀/계정 ID |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID |
