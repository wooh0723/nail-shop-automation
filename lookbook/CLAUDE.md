# CLAUDE.md — 룩북 프로젝트 작업 지침

## 프로젝트 개요

시그니초 네일 네일아트 룩북.
Notion DB → 로컬 JSON/이미지 다운로드 → Next.js 정적 렌더링(SSG) → Vercel 배포.
아키텍처 상세: `ARCHITECTURE.md` 참조.

---

## 작업 방식

- **세션 하나에 목표 하나** — 토큰 효율을 위해 한 세션에 하나의 exec-plan만 완료한다.
- **작업 단위를 작게** — 각 단계마다 완료 조건을 명령어 실행으로 확인 후 다음으로 넘어간다.
- **순차적 실행** — `docs/exec-plans/active/` 디렉토리 내의 파일 번호 순서대로 실행한다.

## 활성 작업 (2026-04-30 기준)

- **PRD**: `docs/PRD-booking-request.md` — 예약 상담 수집 플로우 (문자 링크 → 분기 → 정보입력 → 노션 DB)
- **Active exec-plans**: `013-regression-and-deploy` 1개 남음 (007~012, 014 완료)
- **현재 상태**: plan 014(사전확인 + 방문 예정일 + 노션 스키마 동기화) 완료. plan 013은 **commit + push + 배포만 남음**. 노션 테스트 row 3개 정리는 사용자 액션. 상세는 `docs/exec-plans/active/013-regression-and-deploy.md` "현재 진행 상태" 섹션 참조.
- 세션 시작 시 `.claude/hooks/session-start.sh`가 현재 상태 자동 주입

## 하네스 구성

- `.claude/settings.json` — 공유 허용/차단 목록 + hooks + statusLine
- `.claude/hooks/` — PreToolUse 차단(`guard-edit.sh`, `guard-bash.sh`), Stop 타입체크, SessionStart 컨텍스트
- `.claude/commands/` — `/fetch`, `/deploy`, `/new-plan`, `/done`, `/build`, `/pipeline-status`
- `.claude/skills/` — `notion-booking-write`(PRD 구현 필수 규약), `exec-plan-lifecycle`(plan 운영 규칙)
- `.mcp.json` — Notion MCP(@notionhq/notion-mcp-server, `NOTION_TOKEN` 사용) + Vercel MCP(https://mcp.vercel.com) 자동 활성
- 금지사항은 **hooks로 자동 강제** — 문서만 보고 준수하려 하지 말 것

## 세션 시작/종료 루틴

1. 사용자 요청을 파악한다.
2. 코드 작성 및 수정 작업을 진행한다.
3. **검증:** `npm run build` 로 에러 없음을 확인한다.
4. 사용자 요청 시 git commit + push.
5. **배포:** 코드 변경은 push 후 GitHub Actions 수동 트리거(`gh workflow run`). 노션 데이터는 매일 KST 06:00 자동 동기화.

---

## 금지사항

| 금지사항 | 이유 |
|---------|------|
| `notion.dataSources.query` 사용 | `@notionhq/client` v5에서 생긴 메서드. 현재 프로젝트는 v2 사용(`databases.query`) |
| 런타임에 노션 API 직접 호출 | 속도 저하 및 노션 이미지 URL 1시간 만료 문제 |
| 노션 이미지 URL을 `<img src>`에 그대로 사용 | 1시간 후 링크가 깨짐 — 반드시 로컬 다운로드 + sharp 처리 후 사용 |
| `public/data/`, `public/images/nail/`를 직접 git 커밋 | GitHub Actions가 `git add -f`로 자동 커밋 — 로컬에서는 `.gitignore`에 포함 |
| 에러를 무시하고 진행 (Silently fail) | fetch 실패 시 반드시 에러 로깅 후 `process.exit(1)` |
| 요청 범위(현재 Plan) 초과 작업 | 오버엔지니어링 방지 — 현재 파일의 목표만 달성할 것 |
| Vercel Root Directory 변경 | 현재 `lookbook`으로 고정. 변경 시 Actions 배포와 경로 충돌 발생 |
| Vercel Git 연동 재연결 | 모노레포 구조에서 Root Directory 이중 중첩 + 에러 메일 스팸 발생. 배포는 반드시 GitHub Actions 경유 |
| Actions workflow에서 Deploy 스텝의 `working-directory` 변경 | Deploy 스텝은 반드시 리포 루트(`.`)에서 실행해야 함. `lookbook`에서 실행하면 `lookbook/lookbook` 이중 경로 에러 |
| 커버 이미지를 특정 aspect로 sharp 크롭 | 노션 원본이 아트별로 다른 비율로 업로드되므로 강제 크롭은 손톱 팁/큐티클 잘림 유발. 그리드 컨테이너 aspect로 표시 비율 조정할 것 |
| PEDI 썸네일을 `body[1]` 이미지로 스왑 | 본문 두 번째 이미지는 대부분 **재료/도구 레퍼런스 사진**이지 페디 완성 사진이 아님 (2026-04-20 확인). 썸네일은 `page.cover` 사용 유지 |
| 노션 booking DB 컬럼명을 노션 UI에서만 리네임 | API props 키와 어긋나면 즉시 502. 매니저가 리네임할 경우 `app/api/booking/route.ts` props 매핑도 동시 수정 필요. 현재 매핑: `첨부사진확인(title)`/`유형(select)`/`고객명(rich_text)` |
| RHF Controller 필드 값을 형제/부모에서 `watch()`로 읽기 | Controller mount 타이밍과 watch 구독이 어긋나 setValue 후 re-render 누락. 반드시 `useWatch({ control, name })` 사용 (plan 014 디버깅 노트 참고) |

---

## 핵심 아키텍처 결정

- **데이터:** `scripts/fetch-notion.ts` → `public/data/nailarts.json` + `public/images/nail/*.webp`
- **이미지:** sharp로 750px 리사이즈 + WebP q85 변환. 커버는 **크롭 없이 원본 비율 보존** (출력 치수 `coverWidth`/`coverHeight`를 JSON에 저장)
- **그리드 레이아웃:** NAIL은 5:2 고정 aspect, PEDI는 이미지별 natural aspect + `max-w-[65%] mx-auto` 중앙 정렬
- **카테고리:** 노션 "구분" 프로퍼티(NAIL/PEDI) 기준 필터. 화면 하단 중앙에 `CategoryToggle` 고정 배치
- **렌더링:** Next.js App Router, `generateStaticParams` 사용한 100% 정적 렌더링
- **배포:** GitHub Actions 전용 (Vercel Git 자동 배포는 비활성화 상태)
- **예약 booking DB 스키마** (`NOTION_BOOKING_DATABASE_ID`, 2026-04-30 기준):
  - title: `첨부사진확인` (요청번호 REQ-... 저장)
  - select: `유형` (이달아/타샵디자인), `지점` (홍대/건대/신논현/발산/신림)
  - rich_text: `고객명`, `예약자 메모`, `이달아 메모`, `디자인 메모`
  - phone_number: `연락처`
  - date: `방문일자`
  - relation: `이달아 유형` (lookbook 아트 DB)
  - status: `상태` (자동), created_time: `제출일시` (자동)
  - 본문 image block: 손사진(있으면) + 디자인 이미지(트랙B) — file_upload_id로 attach

---

## 배포 구조

```
코드 변경 → git push(main) → GitHub Actions 자동 트리거 → Vercel 배포
노션 데이터 → GitHub Actions (매일 KST 06:00 자동) → fetch + 커밋 → Vercel 배포
```

- **Vercel Git 연동: 해제됨** — 모노레포 구조에서 Root Directory 이중 중첩으로 빌드 실패 + 에러 메일 스팸 발생. 재연결 절대 금지
- **Vercel Root Directory: `lookbook`** — Vercel API로 설정됨. 절대 변경 금지
- **workflow의 Deploy 스텝: `working-directory: .`(리포 루트)** — `vercel pull`이 Root Directory를 자동 반영하므로 lookbook에서 실행하면 이중 경로 에러
- **Fetch/Install/Build 스텝: `working-directory: lookbook`** — Next.js 프로젝트 위치
- **`vercel deploy` 일시 에러 대비:** `|| echo` 처리로 워크플로우 실패 방지

---

## 디자인 스킬 참조

비주얼 작업(005-visual-design) 시 `docs/skills/supanova/redesign-skill/SKILL.md`를 참조한다.
스킬 원칙은 Next.js 방식으로 적용 (standalone HTML 출력 아님).

---

## Exec-plans 목록

```
001-init-structure              폴더/파일 구조 + 문서 세팅                  ✅
002-fetch-script                노션 fetch 스크립트 및 이미지 다운로더      ✅
003-static-render               Next.js 정적 렌더링(SSG) 뷰 구현            ✅
004-filter-sort                 테마 탭 + 가격 버튼 네비게이션              ✅
005-visual-design               Supanova 스킬 적용 + B&W 스타일링           ✅
006-github-actions              GitHub Actions + Vercel 자동 배포           ✅
007-booking-setup               예약 상담 플로우 환경/DB/의존성 세팅        ✅
008-book-entry-and-draft        /book 분기 페이지 + sessionStorage          ✅
009-lookbook-select-mode        룩북 선택모드(?mode=select) + 팝업          ✅
010-custom-track-and-upload     /book/custom + Notion File Upload API       ✅
011-contact-form                /book/contact + 요약 카드 + zod 검증        ✅
012-booking-api-and-done        /api/booking + /book/done                   ✅
013-regression-and-deploy       회귀 테스트 + 배포 (commit/deploy 대기)     🔄
014-precheck-and-visitdate      사전확인 섹션 + 방문 예정일 + 노션 스키마 동기화 ✅
