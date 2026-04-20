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
  ├── public/data/nailarts.json  (coverWidth/coverHeight 포함)
  └── public/images/nail/{pageId}-{index}.webp  (sharp: 750px 리사이즈 + WebP q85, 크롭 없음)
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
| 이미지 처리 | sharp (750px 리사이즈 + WebP 변환, 크롭 없이 원본 비율 보존) |
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
    │   │   ├── NailArtCard.tsx     # 카드 컴포넌트 (카테고리별 그리드 분기)
    │   │   ├── CategoryToggle.tsx  # NAIL/PEDI 토글 (하단 고정)
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
| 구분 | select | NAIL / PEDI (기본값 NAIL) |
| 테마 | select | 필터 기준 (NAIL 전용, PEDI는 테마 탭 숨김) |
| 가격 | select | 39아트 / 59아트 / 79아트 |
| 시기 | select | 계절/시즌 |
| 제안자 | select | 담당 작업자 |
| 배포 | checkbox | true인 페이지만 fetch 대상 |
| (커버 이미지) | cover | 대표 이미지 (노션은 사용자 업로드 원본 그대로 반환 — 크기/비율이 아트별로 상이함) |
| (본문 블록) | blocks | 상세 이미지, 재료, 구매 링크 |

## 커버 이미지 처리 전략 (2026-04-20 개정)

### 배경
- 노션 `page.cover.file.url`은 사용자가 업로드한 파일을 S3에서 **그대로** 반환 (Notion 측 추가 크롭/variant 없음)
- 업로드 원본 크기가 아트별로 천차만별:
  - NAIL: 대부분 2.0~2.5:1 배너 landscape, 해상도는 452×182~2384×1151 (뒤섞임)
  - PEDI: 전부 1.49~1.96:1 landscape, 해상도 작음 (~250×150 수준)
- 본문(`body`) 이미지는 일반적으로 `body[0]`이 커버와 동일하고, `body[1]` 이후는 고해상도 원본 사진이지만 **PEDI의 경우 재료/도구 레퍼런스 사진**이라 썸네일로 쓰면 안 됨

### 처리 원칙
1. **sharp는 크롭하지 않음** — 가로 750px 리사이즈만 수행(`withoutEnlargement: true`). 원본 비율을 webp에 그대로 보존
2. **실제 출력 치수를 JSON에 저장** — `coverWidth` / `coverHeight` 필드로 클라이언트 레이아웃에 활용
3. **카테고리별 그리드 분기**:
   - NAIL: `aspect-[5/2]` 고정 + `object-cover`. 대부분 소스가 2.2~2.5:1이라 크롭 거의 없음
   - PEDI: 이미지별 natural aspect + `max-w-[65%] mx-auto` 중앙 정렬. 소스가 작아서 컨테이너를 좁혀야 업스케일 블러 방지
4. **상세 페이지 커버**: `width`/`height`에 `coverWidth`/`coverHeight` 전달 + `className="h-auto w-full"`로 자연 비율 렌더

### 절대 금지
- sharp에서 aspect 강제 크롭 (특히 5:2) — 세로 손톱이 잘림
- PEDI 썸네일에 `body[1]` 스왑 — 재료 사진이 대신 노출되는 버그
- 그리드 컨테이너에 네비게이션 링크 — 상세 페이지는 현재 SSG로 존재하나 그리드 클릭 이동 제거됨

---

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
