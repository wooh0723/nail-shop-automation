# 012-booking-api-and-done

## 목표

`/api/booking` 라우트로 노션 페이지 생성 + 트랙B 이미지 블록 append를 처리하고, `/book/done` 완료 화면을 구현한다.

## 배경

- PRD §6 데이터 모델, §7 제출 시 흐름, §4.5 완료 화면
- artId(룩북 카드 id)는 32-char hex(대시 없음). 노션 API는 UUID 대시 형식(`8-4-4-4-12`) 요구.
- 신규: 완료 화면에 **요청번호 노출** (PRD §4.5 보강).

## 작업 목록

### A. 요청번호 생성
- [x] `lib/booking/requestId.ts` — `REQ-YYYYMMDD-HHmmss-xxxx` (KST UTC+9 기준, xxxx = base36 4자)

### B. artId → 노션 page ID 변환
- [x] `lib/booking/notionId.ts` — `toUuid(hex32)` (32-char hex → UUID 대시 형식)

### C. 페이지 생성 API
- [x] `app/api/booking/route.ts` — `POST` + `runtime = 'nodejs'`
  - 서버측 zod 재검증 (`discriminatedUnion` track별 분기)
  - `notion.pages.create` 한글 프로퍼티 매핑 (요청번호/트랙/지점/이름/연락처/공통메모/선호아트/변형메모/디자인메모)
  - 트랙B는 `notion.blocks.children.append`로 `image{type:'file_upload',file_upload_id}` 블록 N개 추가
  - **롤백**: 이미지 append 실패 시 `pages.update({archived:true})`로 orphan 텍스트 row 정리
  - 1시간 TTL 만료 패턴 매칭 → 사용자 친화 메시지

### D. 완료 화면
- [x] `app/book/done/page.tsx`
  - Suspense로 `useSearchParams` 감쌈 (Next.js 16 권장)
  - 요청번호 표시 — query `?req=` 우선, sessionStorage `signicho-booking-last-req` fallback (새로고침 안전)
  - "한 분 더 신청하기" → `clear()` + `/book`
  - "닫기" → `window.close()` 시도 + 150ms 후 `/book` fallback

### E. contact 페이지 연동
- [x] alert placeholder 제거 → `fetch('/api/booking', POST)`
- [x] 트랙별 payload 빌드 (existing/custom)
- [x] 성공 시 `requestId`를 sessionStorage에 저장 + `/book/done?req=...` 이동
- [x] 실패 시 `submitError` 배너 노출, draft 보존하여 재시도 가능

## 완료 조건

- [x] `npm run build` 통과 — 122/122, `/api/booking` ƒ Dynamic, `/book/done` ○ Static
- [x] zod 서버측 재검증 동작
- [x] artId UUID 변환 가드 (잘못된 길이/형식 시 400)
- [x] 트랙B 이미지 append 실패 시 페이지 archive 롤백
- [x] 완료 화면에 요청번호 노출 + "한 분 더" 시 draft clear
- [ ] **실제 노션 row 생성 + 이미지 attach E2E는 plan 013에서 dev server로 검증**

## 상태

`done` (2026-04-24)
