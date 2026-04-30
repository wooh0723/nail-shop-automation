## 목표

예약자 정보 페이지에 **사전확인 섹션**(젤 제거 / 연장 / 파츠 / 현재 손사진)과 **방문 예정일** 필드를 추가하고, 운영 중 매니저가 노션 UI에서 리네임한 컬럼명에 코드를 동기화한다.

## 배경

- 시술 시간 산정에 필요한 사전 정보(젤 제거 여부 등)를 매니저가 예약 시점에 받지 못해 현장 추가 시간이 발생.
- 트랙A 진입 시 본문 image block이 없어 매니저가 현재 손 상태를 확인할 수 없음.
- 운영팀이 노션 DB 컬럼을 리네임(`요청번호→첨부사진확인`, `트랙→유형`, `이름→고객명`)했으나 코드가 따라가지 않아 502 발생.
- 추가로 미사용 `참고 이미지` (files) 컬럼이 남아 있어 정리 필요.

---

## 작업 목록

### A. 사전확인 섹션
- [x] 스키마: `lib/booking/contactSchema.ts` — `precheckSchema` (zod superRefine으로 조건부 필수 검증)
  - Q1 `gelRemoval` 항상 필수
  - Q1=Yes일 때만 Q2 `hasExtension` / Q3 `hasPartsToRemove` 필수
  - Q2 또는 Q3 = Yes일 때 `handPhoto` 필수
  - `contactSchema` (API용 bare) + `contactFormSchema` (form용 = bare + precheck) 분리
- [x] 타입: `lib/booking/types.ts` — `PrecheckDraft`, `HandPhoto`, `YesNo`
- [x] UI: `app/components/booking/PrecheckSection.tsx`
  - **`Controller` + `useWatch({ control })` 패턴** — `register` 안 거친 path는 `watch()` 구독이 mount 타이밍 미스로 안 잡혀 setValue 이후 re-render 누락 (디버깅 노트 참고)
  - 컨트롤드 버튼(role=radio + aria-checked) 토글 — Tailwind `peer-checked:` 의존 제거
- [x] 사진 업로더: `app/components/booking/HandPhotoUploader.tsx` (1장 전용, 4:3 풀폭 미리보기)
- [x] 썸네일 유틸 추출: `lib/booking/imageThumbnail.ts` (ImageUploader와 공유)

### B. 방문 예정일 필드
- [x] `lib/booking/types.ts`, `contactSchema.ts` — `visitDate` (YYYY-MM-DD 정규식, 필수)
- [x] `app/book/contact/page.tsx` — 메모 위에 native `<input type="date" min={오늘}>` 추가
- [x] watch + persist + payload에 통합

### C. API → 노션 매핑
- [x] `app/api/booking/route.ts`
  - props 키 동기화: `요청번호→첨부사진확인`, `트랙→유형`, `이름→고객명`
  - `방문일자: { date: { start } }` 추가
  - `precheckPayloadSchema` — 클라와 동일한 superRefine
  - `formatPrecheck()` — `[사전확인] 젤제거 O / 연장 X / 파츠 O` 한 줄을 `예약자 메모` 앞에 prefix
  - 손사진 image block을 페이지 본문에 append (트랙A·B 모두, 디자인 이미지보다 앞)

### D. 노션 DB 스키마 변경
- [x] `scripts/inspect-booking-db.ts` — 현재 컬럼 목록 조회 (idempotent)
- [x] `scripts/add-visit-date-property.ts` — `방문일자` (Date) 컬럼 추가 (idempotent)
- [x] `scripts/remove-unused-property.ts` — `참고 이미지` (files) 컬럼 제거 (idempotent)
- [x] DB 최종 스키마: `첨부사진확인(title)`, `유형(select)`, `지점(select)`, `고객명(rich_text)`, `연락처(phone_number)`, `방문일자(date)`, `예약자 메모(rich_text)`, `이달아 유형(relation)`, `이달아 메모(rich_text)`, `디자인 메모(rich_text)`, `상태(status)`, `제출일시(created_time)`

---

## 디버깅 노트 — RHF subscription timing

`useForm`의 `watch(name)`은 호출 시점에 등록되지 않은 path는 구독 누락. 증상:
- `setValue("precheck.gelRemoval", "yes")` 호출 → `Controller`가 onChange로 자기 자신은 re-render
- 그러나 부모/형제의 `watch("precheck.gelRemoval")`는 undefined 유지 → 조건부 reveal 작동 안 함

해결: **`useWatch({ control, name })`** — control 인스턴스를 통해 명시적 구독, mount 타이밍 무관.
교훈: Controller로 다루는 필드의 값을 다른 컴포넌트에서 읽을 때는 `watch` 대신 `useWatch` 사용.

---

## 검증

- [x] `npx tsc --noEmit` — 0 에러
- [x] Playwright 자동 검증 (모바일 viewport 390px)
  - precheck reveal/hide 매트릭스 10개 케이스 PASS
  - sessionStorage persist + 새로고침 복원 PASS
  - visitDate input 렌더 + persist PASS
- [x] E2E submit (트랙A) → `/api/booking 200`, `/book/done` 라우팅, 노션 row 생성 확인
  - 테스트 row: `REQ-20260430-113620-wu0c` (사용자 정리 필요)

---

## 상태

`done` (2026-04-30)
