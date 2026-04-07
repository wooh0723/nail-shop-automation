# 005-visual-design

## 목표

Supanova redesign-skill 기준으로 룩북 UI를 B&W 프리미엄 스타일로 업그레이드한다.

## 배경

- 참조 스킬: `docs/skills/supanova/redesign-skill/SKILL.md`
- 현재 상태: 기능 동작하는 기본 Tailwind 스타일 (회색 계열, 별도 폰트 없음)
- 목표 스타일: 네일샵 룩북에 맞는 B&W 미니멀 프리미엄 — 흑백 기반, Pretendard 타이포그래피, 섬세한 hover 인터랙션
- 스택 유지: Next.js + Tailwind (CDN이 아닌 설치형) — standalone HTML이 아니므로 스킬 원칙을 Next.js 방식으로 적용

## 디자인 방향

- **컬러:** 흑백 기반. 배경 `#fafafa` (오프화이트), 텍스트 `#0a0a0a`. 악센트 없음
- **폰트:** Pretendard (Google Fonts 또는 CDN via `layout.tsx` `<link>`) — Inter/Noto Sans KR 제거
- **카드:** 이미지 위주, 텍스트 최소화. hover 시 살짝 scale up + overlay fade
- **탭/네비:** 얇은 border, 활성 탭 검정 underline — 현재 구조 유지하되 간격/크기 정제
- **상세 페이지:** 여백 넉넉, 태그 미니멀 (pill → 밑줄 텍스트 or 심플 badge)

## 작업 목록

- [ ] `app/layout.tsx` — Pretendard 폰트 로드, body 배경색 `#fafafa`로 변경
- [ ] `app/globals.css` — 기본 font-family Pretendard 적용, `word-break: keep-all` 전역 설정
- [ ] `app/page.tsx` — 헤더 타이포그래피 개선 (크기/자간)
- [ ] `app/components/ThemeTabs.tsx` — 탭 간격, 활성 스타일, 폰트 개선
- [ ] `app/components/PriceSwiper.tsx` — dot indicator 스타일 개선
- [ ] `app/components/NailArtCard.tsx` — hover overlay, 텍스트 레이아웃 개선
- [ ] `app/art/[id]/page.tsx` — 상세 페이지 여백/태그/링크 스타일 개선

## 완료 조건

- [ ] Pretendard 폰트 실제 적용 확인 (DevTools font 탭)
- [ ] 카드 hover 인터랙션 동작
- [ ] 전체 흑백 톤 유지 (파란 링크, 회색 배경 등 제거)
- [ ] `npm run build` 에러 없음
- [ ] 모바일(375px) 레이아웃 깨짐 없음

## 추가 UX 스펙 (확정)

### 헤더
- 왼쪽: 워드마크 `SIGNITURE NAIL` (serif, bold)
- 오른쪽: 시기 목록 — 현재 월 진하게, 이전 월들 흐리게 나열 (클릭 시 월 전환)

### 가격 네비게이션
- 현재 가격 크게 (15px bold) + 다음 가격 작게 (9px, 흐림) 오른쪽에 붙음
- 페이지 로드 1.2초 후 작은 텍스트가 오른쪽으로 nudge 애니메이션 (스와이프 유도)
- 스와이프 또는 작은 텍스트 클릭으로 전환
- 전환 시 위계 자동 업데이트 (59아트 크게 → 79아트 작게)
- 테마 탭 전환 시 가격 39아트로 리셋

## 상태

`in_progress`
