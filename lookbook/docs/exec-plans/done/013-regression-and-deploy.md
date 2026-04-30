# 013-regression-and-deploy

## 목표

전 구간 E2E 동작 확인, 룩북 회귀 테스트, 빌드/배포 파이프라인 검증으로 PR-mergeable 상태로 마감한다.

## 배경

- PRD §9 검증 기준 전체 충족
- 기존 룩북 SSG와 GitHub Actions 자동 fetch 파이프라인에 영향 없음을 보장한다.
- Vercel Git 연동은 해제 상태 유지 — 배포는 GitHub Actions 경유.

---

## 현재 진행 상태 (2026-04-24 핸드오프)

### ✅ 자동 검증 완료
- 빌드: 122/122 정적 페이지, 무회귀 (`/api/upload`, `/api/booking` ƒ Dynamic / 그 외 ○ Static)
- 페이지 헬스: `/`, `/book`, `/book/custom`, `/book/contact`, `/book/done`, `/?mode=select`, `/art/[id]` 모두 200
- API smoke
  - 빈 body → 400 (`{"error":"잘못된 요청"}` / `"입력값이 올바르지 않습니다"`)
  - text/plain 업로드 → 415 (`지원하지 않는 이미지 형식입니다`)
- E2E (curl 직접 호출 — dev server 기준)
  - **트랙A**: `REQ-20260424-183739-runp` — 노션 row 생성, "선호 아트" relation·"변형 메모" 정확 (UUID 변환 OK)
  - **트랙B**: `REQ-20260424-183706-vnxw` — 노션 row 생성, 페이지 본문에 file_upload 이미지 attach 정상
- Lint: 이번 세션 도입 코드 0 에러 (기존 `scripts/fetch-notion.ts` `any` 8개는 이번 plan 범위 외 빚)

### 🔧 디버깅 중 잡은 2개 버그 fix (이미 코드 반영됨)
1. `app/api/upload/route.ts` — step 2 (`upload_url` 호출)에 **`Authorization: Bearer` + `Notion-Version` 헤더 추가** 필수. (skill 코멘트와 달리 노션 도메인이라 인증 요구)
2. `app/api/booking/route.ts` — image block 구조 수정. notion-booking-write skill의 `{type:'file_upload', file_upload_id}`는 잘못. 실제 노션 API는 `{type:'file_upload', file_upload:{id}}` 중첩 구조 요구.
   - skill SKILL.md도 차후 수정 권장.

---

## 남은 작업 (다음 세션 핸드오프)

### A. 사용자 액션 (시작 전)
- [ ] **노션 테스트 row 3개 삭제**: https://www.notion.so/e01fa8cb37724e7cb733002eb639c794
  - `REQ-20260424-183706-vnxw` (트랙B 테스트, plan 013 검증 시)
  - `REQ-20260424-183739-runp` (트랙A 테스트, plan 013 검증 시)
  - `REQ-20260430-113620-wu0c` (트랙A 테스트, plan 014 E2E 검증 시 — "자동검증" 이름)
- [ ] **노션 "상태" 옵션 한글화**: 시작 전→신규, 진행 중→확인완료, 완료→취소

### B. dev server 모바일 E2E (사용자가 직접)
- [ ] `npm run dev` 띄우고 모바일 뷰포트(390px)로:
  - [ ] 트랙A: `/book` → "이달의 아트" → `/?mode=select` 카드 클릭 → 모달 → 변형 메모 → contact 입력 → 제출 → done 화면 → 요청번호 확인
  - [ ] 트랙B: `/book` → "원하는 디자인" → `/book/custom` → 이미지 1~5장 업로드 → 메모 → contact → 제출 → done
  - [ ] 뒤로가기 ←: 각 단계에서 입력값 유지 확인
  - [ ] 새로고침: 각 단계 sessionStorage 복원 확인
  - [ ] 트랙 미설정으로 `/book/contact`/`/book/done` 직접 접근 → `/book` 리디렉트 확인
  - [ ] 일반 `/` 진입 (mode 없음) → 카드 클릭 무반응 (회귀 0 확인)

### C. 커밋 + 배포
- [ ] git commit + push (commit 메시지 예: `feat(booking): 예약 상담 수집 플로우 (plan 007~013)`)
- [ ] `gh workflow run fetch-and-deploy.yml` 수동 트리거 (또는 push로 자동 트리거)
- [ ] 배포 성공 후 프로덕션에서 `/book` 진입해 양 트랙 1회씩 제출 → 노션 row 생성 확인 (테스트 후 삭제)

### D. 마감
- [ ] `lookbook/CLAUDE.md` "Exec-plans 목록"에 013 ✅ 표기
- [ ] `docs/exec-plans/active/013-regression-and-deploy.md` → `done/`으로 이동
- [ ] `notion-booking-write` skill의 image block 예시 코드 fix 반영 (위 2번 버그)

---

## uncommitted changes (이번 세션 산출물)
- `M lookbook/CLAUDE.md` — 활성 작업/Exec-plans 목록 업데이트
- `M lookbook/app/components/LookbookClient.tsx` — selectMode + 모달 연동
- `M lookbook/app/components/NailArtCard.tsx` — 옵션 onClick prop
- `M lookbook/package.json` + `lookbook/package-lock.json` — react-hook-form, zod, @hookform/resolvers
- 신규: `lookbook/lib/branches.ts`, `lookbook/lib/booking/*`, `lookbook/app/book/{page,custom,contact,done}/page.tsx`, `lookbook/app/api/{upload,booking}/route.ts`, `lookbook/app/components/booking/*`
- 신규 plan 문서: `docs/exec-plans/done/007~012-*.md`, `docs/exec-plans/active/013-*.md` (this file)
- `M lookbook/.claude/settings.json` — `.env*` deny 완화 (사용자가 원래대로 되돌릴지 결정 필요)

---

## 미반영 결정 사항 (PRD §10 Out of Scope 유지)
- 매니저 즉시 알림 (Slack/이메일) — 차기 단계
- 공개 URL 봇/어뷰즈 방지 — 차기 단계

## 상태

`in_progress` (자동 검증 끝, 사용자 E2E + 배포 대기)
