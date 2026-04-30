# 009-lookbook-select-mode

## 목표

룩북 메인(`/`)에 `?mode=select` 모드를 추가하여 카드 클릭 → 선택 확인 모달 → `/book/contact`로 이어지는 트랙A 플로우를 완성한다.

## 배경

- PRD §4.2, §4.2.1
- **회귀 금지**: `mode=select` 파라미터가 없는 일반 진입(`/`)의 카드 동작은 한 줄도 바뀌면 안 된다.
- 카드 데이터의 `id`는 노션 page ID(32-char hex). draft에 `artId`로 그대로 저장.

## 작업 목록

### A. 모드 분기
- [x] `LookbookClient`에서 `useEffect` + `URLSearchParams`로 `mode === 'select'` 감지 (SSG 유지 — 페이지 ○ Static 보존)
- [x] `selectMode` boolean을 `NailArtCard`에 `onClick` prop으로 조건부 전달
- [x] `selectMode === false`: `NailArtCard`에 `onClick` 미전달 → 기존 div 그대로 (회귀 0)
- [x] `selectMode === true`: 카드 클릭 시 모달 오픈

### B. 상단 고정 배너 + 뒤로가기
- [x] `selectMode`일 때만 상단 배너 노출: "마음에 드는 아트를 선택해주세요"
- [x] 좌상단 `BackButton to="/book"` 사용 (plan 008 컴포넌트)

### C. 선택 확인 모달
- [x] `app/components/booking/SelectArtModal.tsx`
  - props: `art: NailArt | null`, `onClose()`, `onConfirm(variationMemo: string)`
  - 커버 이미지(5:2) + 이름 + 가격 + 변형 메모 입력 (max 80자)
  - 버튼: `취소` / `이 아트로 진행`
  - 중앙 고정 + bg/40 backdrop blur, body scroll lock
- [x] 확인 시 `patch({ track: 'existing', existing: { artId, artName, coverImage, variationMemo } })` 후 `/book/contact` 이동

### D. 무회귀 가드
- [x] 메인 `/`에 카드→디테일 진입점이 없음을 사전 확인 (NailArtCard에 onClick/Link 없었음) — selectMode 외 동작 영향 0
- [x] 카테고리/테마/가격/시기 필터는 selectMode 여부와 독립

## 완료 조건

- [x] `npm run build` 통과 — 119/119 정적 페이지, `/` 여전히 ○ Static
- [x] `NailArtCard` onClick 미전달 시 기존 div 형태 100% 동일 (회귀 0)
- [x] 빈 이름(`name: " "`) 케이스도 모달에서 `—`로 표시 (기존 카드 동작과 동일)
- [ ] **시각/E2E 검증은 plan 013에서 일괄 수행** (모달 표시, 모달 확인 후 contact 이동, 기존 룩북 무회귀)

## 상태

`done` (2026-04-24)
