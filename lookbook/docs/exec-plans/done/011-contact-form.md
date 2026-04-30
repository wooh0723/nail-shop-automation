# 011-contact-form

## 목표

`/book/contact` — 이전 단계 요약 + 예약자 정보 입력 + Zod 검증 폼을 완성한다.

## 배경

- PRD §4.4
- 트랙A/B 모두 이 단계를 거친다.
- 1시간 TTL 가드는 plan 010의 헬퍼를 재사용해 트랙B 진입 시 동일하게 노출.

## 작업 목록

### A. 요약 카드
- [x] `app/components/booking/SummaryCard.tsx`
  - 트랙A: 16x16 썸네일 + 이름 + 변형 메모 (line-clamp-3)
  - 트랙B: 5열 썸네일 그리드(previewDataUrl, HEIC fallback) + 메모 요약
  - `변경` 버튼 → 트랙별 직전 단계로 (`/?mode=select` 또는 `/book/custom`), draft 보존

### B. 폼
- [x] `lib/booking/contactSchema.ts` — Zod 스키마
  - `branch`: enum(BRANCHES) — 한글 메시지
  - `name`: 1~40자
  - `phone`: `/^01[016789]-?\d{3,4}-?\d{4}$/`
  - `memo`: optional, max 500
- [x] `app/book/contact/page.tsx` — 클라이언트 컴포넌트
  - hydrated 후 `ContactForm` 별도 컴포넌트로 분리 → defaultValues 정확 적용
  - `react-hook-form` + `zodResolver`
  - 지점 select(BRANCHES) / 이름 / 연락처(tel) / 공통 메모(textarea)
  - `watch` + `useEffect`로 키 입력마다 sessionStorage 저장 → 새로고침 복원
  - `제출` 버튼 — disabled + 스피너 (실 제출은 plan 012에서 연결, 현재는 alert placeholder)
- [x] 좌상단 ← → 트랙별 직전 단계 (`backTo`)

### C. TTL 가드 (트랙B만)
- [x] 진입 시 `draft.custom.uploadedAt` 50분 경과면 노란 경고 배너 (custom으로 변경 유도)

### D. 직접 진입 방지
- [x] `useEffect`로 `draft.track === null`이면 `router.replace('/book')`

## 완료 조건

- [x] `npm run build` 통과 — 121/121, `/book/contact` ○ Static
- [x] 양 트랙에 맞는 요약 카드 렌더 (트랙A=썸네일+이름+변형, 트랙B=그리드+메모)
- [x] zod 검증 — 필수 미입력 시 한글 에러 메시지 + 제출 차단
- [x] 전화번호 정규식 검증 동작 (010-1234-5678 형식)
- [x] watch 기반 sessionStorage 저장으로 새로고침 시 복원
- [x] 트랙 미설정으로 직접 접근 시 `/book`으로 리디렉트
- [ ] **시각/E2E 검증은 plan 013에서 일괄**

## 상태

`done` (2026-04-24)
