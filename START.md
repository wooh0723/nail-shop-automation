# 룩북 프로젝트 시작 컨텍스트

## 배경

시그니초 네일(nail salon, 5개 지점)의 네일아트 온라인 룩북.
작업자들이 노션에 업로드한 작업물을 정적 사이트로 서빙한다.

---

## 아키텍처 결정사항

- 런타임에 노션 API 호출 없음 → 빌드 타임에 로컬 저장
- 노션 이미지 URL은 1시간 후 만료 → 반드시 로컬 다운로드
- `notion.dataSources.query` 사용 금지 → `notion.databases.query` 사용
- 배포: Vercel + GitHub Actions (로컬 노트북 꺼져 있어도 동작)

## 데이터 흐름

```
노션 DB
  ↓ (GitHub Actions 스케줄 or 수동 트리거)
scripts/fetch-notion.ts
  ├── public/data/nailarts.json
  └── public/images/nail/{pageId}-{index}.jpg
  ↓
Next.js 정적 렌더링 (노션 API 호출 없음)
  ├── /          룩북 메인 그리드
  └── /art/[id]  아트 상세 페이지
```

## 노션 DB 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---------|------|------|
| 이름 | title | 아트명 |
| 테마 | select | 필터 기준 |
| 가격 | select | 39아트 / 59아트 / 79아트 |
| 시기 | select | 계절/시즌 |
| 제안자 | select | 담당 작업자 |
| (커버 이미지) | cover | 대표 이미지 |
| (본문 블록) | blocks | 상세 이미지, 재료, 구매 링크 |

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- @notionhq/client (공식 SDK)
- Vercel 배포

## 환경변수

```bash
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=...
```

---

## 작업 방식

- 작업 단위를 작게 쪼개서 진행
- 각 단계마다 완료 조건 통과 확인 후 다음으로
- `exec-plans/active/` 에 명세 파일 순서대로 실행
- 토큰 효율을 위해 세션 하나에 목표 하나

---

## 작업 순서 (모두 완료)

```
001-init-structure      폴더/파일 구조 + 문서 세팅              ✅
002-fetch-script        노션 fetch 스크립트 구현                ✅
003-static-render       Next.js 정적 렌더링 구현                ✅
004-filter-sort         테마 탭 + 가격 버튼 필터                ✅
005-visual-design       B&W 스타일링 + Supanova 스킬 적용       ✅
006-github-actions      GitHub Actions + Vercel 자동 배포       ✅
```

## 현재 상태

- 프로덕션 배포 완료: Vercel (GitHub 연동, push 시 자동 배포)
- GitHub Actions: 매일 KST 06:00 노션 데이터 자동 동기화
- 리포: github.com/wooh0723/nail-shop-automation (private)
