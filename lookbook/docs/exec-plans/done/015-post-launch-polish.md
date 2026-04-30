## 목표

Plan 014 commit/deploy 직후 운영 피드백을 반영해 룩북 정렬·UI 디테일·필드 정책·인프라 이슈를 한 사이클에 정리한다.

## 배경

- Plan 014로 booking 플로우가 프로덕션에 올라간 직후 원장 QA 직전 발견된 사용성·인프라 이슈를 묶어 처리.
- 매니저가 노션 DB에 `순서` (select) 컬럼을 신규 추가하여 카드 노출 순서를 직접 제어할 수 있게 했음.

---

## 작업 목록

### A. 룩북 카드 정렬 (`순서` 컬럼)
- [x] `scripts/fetch-notion.ts` — `순서` select 옵션을 정수로 파싱(`getSelectAsOrder`), `order` 필드를 JSON에 추가, `results.sort((a,b) => a.order - b.order || a.name.localeCompare(b.name))`
- [x] `lib/nailarts.ts` — `NailArt` 인터페이스에 `order: number` 추가
- [x] 미지정 값은 `Number.MAX_SAFE_INTEGER`로 가장 뒤로
- [x] 페이지 컴포넌트는 무수정 — JSON 사전 정렬로 끝

### B. UI 폴리시
- [x] `/book` 진입 페이지 타이틀: "디자인 시술 사전 접수" → "아트/디자인 사전 접수"
- [x] `/?mode=select` SSR HTML에 "Signicho Nail" 박힘 → FOUC 발생
  - 원인: `app/page.tsx`가 정적 prerender되어 `searchParams`가 빈 값으로 빌드 시점 고정
  - 수정: `app/page.tsx`에 `export const dynamic = "force-dynamic"` + `searchParams: Promise<{mode?:string}>` 받기 → `LookbookClient`에 `initialSelectMode` prop 전달
  - `LookbookClient`의 client-side useEffect URL 감지 로직 제거
- [x] `/?mode=select` 카드 하단 아트명 `<p>` 숨김 (`onClick` prop 있을 때만), 기존 lookbook은 유지
- [x] `SelectArtModal` 팝업의 아트명 + 가격/테마 행 제거 (커버 + 메모 입력 + 버튼만 유지)

### C. 이미지 업로드 413 → 클라이언트 리사이즈
- [x] 폰 사진(10MB+)이 Vercel 4.5MB body cap에 막혀 핸들러 도달 전 413
- [x] `lib/booking/imageThumbnail.ts`에 `resizeForUpload(file, 1920, 0.85)` 추가 — canvas로 maxDim 1920px JPEG 재인코딩
- [x] `ImageUploader`(트랙B), `HandPhotoUploader`(사전확인) 양쪽 모두 업로드 직전 호출
- [x] HEIC 등 브라우저 디코드 실패 시 원본 fallback (`img.onerror` → resolve(file))

### D. 지점 select 화살표 위치 표준화
- [x] native `<select>` chevron이 브라우저별로 다르게 렌더링되는 문제 → `appearance-none` + 절대 위치 `▾` glyph로 대체
- [x] `right-3 top-1/2 -translate-y-1/2 text-[10px]` — 일관된 위치

### E. 필드 정책: 이름·연락처만 필수
- [x] `contactSchema`: `branch`, `visitDate` 둘 다 `union(["", valid])` + `optional()`
- [x] `precheckSchema`: superRefine 제거 — 모든 필드 옵셔널
- [x] 라벨에 "(선택)" 표기: `지점`, `방문 예정일`, `예약 전 확인` 섹션 헤더
- [x] `app/book/contact/page.tsx` `onSubmit`: `cleanPrecheck`이 미응답(`gelRemoval` undefined) 시 `{}` 전송
- [x] `app/api/booking/route.ts`:
  - 빈 `branch`/`visitDate`는 props에서 생략 (조건부 추가)
  - `precheckPayloadSchema`도 옵셔널 + superRefine 제거
  - `formatPrecheck()`이 `gelRemoval` 미응답이면 빈 문자열 반환 → 메모 prefix 안 붙음

### F. 인프라 — Pro 업그레이드 후 env 복구
- [x] Vercel 무료 → Pro 업그레이드 직후 production 환경변수 3개(`NOTION_TOKEN`, `NOTION_DATABASE_ID`, `NOTION_BOOKING_DATABASE_ID`)가 전부 사라짐 → 모든 API 500 (`서버 설정 오류`)
- [x] `.env.local`에서 `vercel env add ... production` 으로 재등록 → 워크플로우 재실행 → 정상 복구

### G. 기타
- [x] 노션 DB 컬럼명 매니저 리네임 반영 — 코드 props 키 동기화 (`요청번호→첨부사진확인`, `트랙→유형`, `이름→고객명`)
- [x] 미사용 `참고 이미지` (files) 컬럼 제거 (`scripts/remove-unused-property.ts`)
- [x] 진단 스크립트 추가: `scripts/inspect-booking-db.ts`, `scripts/inspect-nail-db.ts`, `scripts/preview-order.ts`

---

## 검증

- Playwright 자동 검증
  - precheck reveal/hide 매트릭스 + sessionStorage persist + 새로고침 복원 (15+ 케이스)
  - 트랙A/B 끝-끝 제출 → 200 + 노션 row 생성
  - 최소 필드(이름·연락처만) 제출 → 200 + 노션 row 생성
  - 정렬 — 필터 적용 후 카드 1·2·3·4 순서대로 노출
- 프로덕션 헬스체크: 모든 라우트 200 / `/api/booking` 정상

---

## 운영 메모 — 노션 테스트 row 정리 (사용자 액션)

이번 사이클까지 누적된 자동검증 row, 노션에서 일괄 삭제 필요:
- `REQ-20260424-183706-vnxw`
- `REQ-20260424-183739-runp`
- `REQ-20260430-113620-wu0c`
- `REQ-20260430-135304-e2pb`
- `REQ-20260430-142550-pbqt`
- `REQ-20260430-143035-hbra`

DB: https://www.notion.so/e01fa8cb37724e7cb733002eb639c794

---

## 상태

`done` (2026-04-30)
