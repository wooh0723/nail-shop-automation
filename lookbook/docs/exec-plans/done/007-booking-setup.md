# 007-booking-setup

## 목표

예약 상담 수집 플로우 구현을 위한 기반 환경을 갖춘다.
의존성 설치, 환경변수 등록, 노션 신규 DB 연결 확인까지 끝낸다.

## 배경

- 신규 기능: PRD `docs/PRD-booking-request.md`
- 기존 룩북 SSG/배포 파이프라인을 절대 건드리지 않는다.
- `next.config.ts`에는 `output: 'export'` 설정이 **없으므로** 제거 작업 불필요. 확인만 한다.

## 작업 목록

### A. 의존성
- [x] `lookbook/`에서 `npm i react-hook-form zod @hookform/resolvers` 설치
- [x] `@notionhq/client` 2.3.0 메서드 확인 — `fileUploads` **없음** → `fetch` 직접 호출 경로 확정 (skill의 `/api/upload` 예시 그대로)

### B. 환경변수 (외부 입력 의존 — PRD §12)
- [x] 5개 지점 옵션 확정: 홍대·건대·신논현·발산·신림 (메모리 보유)
- [x] 노션 신규 DB "예약 상담 요청" 생성 — `e01fa8cb37724e7cb733002eb639c794` (data_source: `2e9934c9-5a5e-4e09-beb5-14727b6c3cff`)
- [x] DB ID 발급 → `lookbook/.env.local`에 `NOTION_BOOKING_DATABASE_ID` 등록
- [x] GitHub Secrets에 동일 키 등록 (`gh secret set`)
- [x] 신규 DB 프로퍼티 PRD §6 표대로 생성 (지점/트랙 옵션 명시 포함)
- [ ] 노션 UI에서 "상태" status 옵션 한글화 (시작전→신규, 진행중→확인완료, 완료→취소) — **사용자 수동 1분, 코드 영향 0**

### C. 사전 검증
- [x] `next.config.ts`에 `output` 키 없음 재확인
- [x] `npm run build` 통과 (의존성 설치 후 118 정적 페이지 무회귀)
- [x] `lookbook/lib/branches.ts` 신규 — 5개 지점 상수 export

## 완료 조건

- [x] 신규 의존성 3개가 `package.json`에 반영됨
- [x] `.env.local`/Secrets에 `NOTION_BOOKING_DATABASE_ID` 등록 완료
- [x] 노션 DB가 PRD §6 스펙대로 존재 + 인테그레이션 권한 부여됨 (MCP 토큰 = `NOTION_TOKEN`이라 자동 보유)
- [x] `npm run build` 통과
- [x] `branches.ts` 상수 모듈 존재

## 상태

`done` (2026-04-24)
