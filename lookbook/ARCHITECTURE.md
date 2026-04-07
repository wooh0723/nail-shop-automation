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
  └── public/images/nail/{pageId}-{index}.webp  (sharp: 750px 리사이즈 + WebP q85)
  ↓
Next.js 정적 렌더링 (노션 API 호출 없음)
  ├── /          룩북 메인 (테마탭 + 가격 스위처 + 시기 드롭다운)
  └── /art/[id]  아트 상세 페이지
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프레임워크 | Next.js 15 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 이미지 처리 | sharp (리사이즈 + WebP 변환 + 가격대별 크롭) |
| 노션 연동 | @notionhq/client (공식 SDK) |
| 배포 | Vercel (GitHub 연동 — push 시 자동 배포) |
| 자동화 | GitHub Actions (매일 KST 06:00 + 수동 트리거) |

## 디렉토리 구조

```
nail-shop-automation/           # 루트 (GitHub 리포)
├── .github/workflows/
│   └── fetch-and-deploy.yml    # GitHub Actions 워크플로우
└── lookbook/                   # Next.js 프로젝트
    ├── app/
    │   ├── page.tsx              # 룩북 메인 (SSG)
    │   ├── art/[id]/page.tsx     # 아트 상세 페이지 (SSG)
    │   ├── components/
    │   │   ├── LookbookClient.tsx  # 메인 클라이언트 (필터/정렬 상태)
    │   │   ├── NailArtCard.tsx     # 카드 컴포넌트
    │   │   ├── PriceSwiper.tsx     # 가격 스위처 (버튼)
    │   │   └── ThemeTabs.tsx       # 테마 탭
    │   ├── globals.css             # B&W 스타일 + 애니메이션
    │   └── layout.tsx
    ├── lib/
    │   └── nailarts.ts           # NailArt 타입 + JSON 로더
    ├── scripts/
    │   └── fetch-notion.ts       # 노션 fetch + sharp 이미지 처리
    ├── public/
    │   ├── data/nailarts.json    # fetch 결과 (git 제외)
    │   └── images/nail/          # WebP 이미지 (git 제외)
    └── docs/
        ├── FRONTEND.md
        ├── SECRETS.md
        └── exec-plans/done/      # 완료된 작업 명세 (001~006)
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
| `VERCEL_TOKEN` | Vercel 계정 토큰 | https://vercel.com/account/tokens 에서 생성 |
| `VERCEL_ORG_ID` | Vercel 팀/계정 ID | `npx vercel link` 후 `.vercel/project.json`의 `orgId` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `npx vercel link` 후 `.vercel/project.json`의 `projectId` |

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

| 변수 | 설명 | 획득 방법 |
|------|------|-----------|
| `VERCEL_TOKEN` | Vercel 계정 토큰 | https://vercel.com/account/tokens 에서 생성 |
| `VERCEL_ORG_ID` | Vercel 팀/계정 ID | `npx vercel link` → `.vercel/project.json`의 `orgId` |
| `VERCEL_PROJECT_ID` | Vercel 프로젝트 ID | `npx vercel link` → `.vercel/project.json`의 `projectId` |
