# 008-book-entry-and-draft

## 목표

`/book` 분기 페이지와 sessionStorage 기반 draft 상태 훅을 구현한다.

## 배경

- PRD §4.1, §5
- `signicho-booking-draft` 키로 단일 draft 객체를 관리한다.
- 페이지 이동·새로고침 시 복원, 제출 성공/"한 분 더" 시 clear.

## 작업 목록

### A. 상태 훅
- [x] `lib/booking/types.ts` — `BookingDraft` 타입 정의 (`Branch` import + 세부 타입 분해)
- [x] `lib/booking/useBookingDraft.ts` — `{ draft, patch, replace, clear, hydrated }`
  - SSR 안전 (`typeof window === 'undefined'` 가드)
  - mount 시 1회 read → `hydrated` 플래그 노출
- [x] `custom.uploadedAt: number` 필드 자리 마련 (plan 010에서 사용)

### B. `/book` 페이지
- [x] `app/book/page.tsx` — 클라이언트 컴포넌트
  - 헤더 카피, 풀폭 버튼 2개
  - "이달의 아트" → `patch({track:'existing'})` + `/?mode=select`
  - "원하는 디자인" → `patch({track:'custom'})` + `/book/custom`
  - 뒤로가기 아이콘 미노출 (진입점)
- [x] B&W 톤·`max-w-[390px]`·48px 터치 타겟(h-14)·`stagger-reveal`·Cormorant 타이틀

### C. 공통
- [x] `app/components/booking/BackButton.tsx` — 좌상단 ← 컴포넌트 (router.back 또는 to prop)
  - 위치는 기존 컨벤션(`app/components/`)에 맞춤

## 완료 조건

- [x] `/book` 정적 페이지 빌드됨 (119/119)
- [x] 두 버튼이 의도한 경로로 push (`patch` 후 `router.push`)
- [x] sessionStorage 복원 — `hydrated` 플래그로 SSR 안전
- [x] `npm run build` 통과
- [x] 기존 `/`, `/art/[id]` 정적 페이지 118개 무회귀
- [ ] **시각/E2E 검증은 plan 013 통합 회귀에서 수행** (모바일 뷰포트 + devtools sessionStorage 확인)

## 상태

`done` (2026-04-24)
