# 004-filter-sort

## 목표
테마 탭 + 가격 스와이프 네비게이션을 구현한다.

## 배경
- 테마 4개 (NUANCE / LOVELY / HIP KITSCH / FRIENDS) — 상단 고정 탭
- 가격 3단계 (39 / 59 / 79) — 좌우 스와이프로 전환
- 클라이언트 사이드 state 관리 (URL 파라미터 불필요)
- 시기는 카드 우측 라벨로만 표시, 필터 없음

## 작업 목록
- [ ] `src/components/ThemeTabs.tsx` — 테마 탭 (4개 고정)
- [ ] `src/components/PriceSwiper.tsx` — 가격 스와이프 + dot indicator
- [ ] `src/app/page.tsx` — theme/price state 연결 + 카드 필터링

## 완료 조건
- [ ] 테마 탭 클릭 시 해당 테마 카드만 노출
- [ ] 가격 스와이프 시 39 → 59 → 79 전환
- [ ] 테마 탭 전환 시 가격 페이지 39로 리셋
- [ ] `npm run build` 에러 없음

## 상태
`pending`
