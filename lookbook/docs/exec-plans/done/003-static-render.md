# 003-static-render

## 목표

`public/data/nailarts.json` 을 읽어 Next.js 정적 페이지를 렌더링한다.

## 배경

- 런타임 노션 API 호출 없음
- `nailarts.json` 은 빌드 타임에 존재해야 함 (002 실행 후)
- `generateStaticParams` 로 `/art/[id]` 정적 생성

## 작업 목록

- [ ] `app/page.tsx` — 메인 그리드 구현
- [ ] `app/art/[id]/page.tsx` — 상세 페이지 구현
- [ ] `app/components/NailArtCard.tsx` — 카드 컴포넌트
- [ ] `app/components/NailArtGrid.tsx` — 그리드 레이아웃
- [ ] `next.config.ts` — 로컬 이미지 경로 설정

## 완료 조건

- [ ] `npm run build` 성공 (빌드 에러 없음)
- [ ] `npm run dev` 후 `http://localhost:3000` 에서 그리드 확인
- [ ] `http://localhost:3000/art/{id}` 상세 페이지 렌더링됨
- [ ] 이미지가 `next/image` 로 표시됨 (노션 URL 사용 안 함)

## 상태

`pending`
