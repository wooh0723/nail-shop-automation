# CLAUDE.md — 룩북 프로젝트 작업 지침

## 프로젝트 개요

시그니초 네일 네일아트 룩북.
Notion DB → 로컬 JSON/이미지 다운로드 → Next.js 정적 렌더링(SSG) → Vercel 배포.
아키텍처 상세: `ARCHITECTURE.md` 참조.

---

## 작업 방식

- **세션 하나에 목표 하나** — 토큰 효율을 위해 한 세션에 하나의 exec-plan만 완료한다.
- **작업 단위를 작게** — 각 단계마다 완료 조건을 명령어 실행으로 확인 후 다음으로 넘어간다.
- **순차적 실행** — `docs/exec-plans/active/` 디렉토리 내의 파일 번호 순서대로 실행한다.

## 세션 시작/종료 루틴

모든 exec-plan(001~006)이 완료되어 현재 active plan 없음.
새 작업은 사용자 요청에 따라 진행.

1. 사용자 요청을 파악한다.
2. 코드 작성 및 수정 작업을 진행한다.
3. **검증:** `npm run build` 로 에러 없음을 확인한다.
4. 사용자 요청 시 git commit + push (Vercel 자동 배포).

---

## 금지사항

| 금지사항 | 이유 |
|---------|------|
| `notion.dataSources.query` 사용 | `@notionhq/client` v5에서 생긴 메서드. 현재 프로젝트는 v2 사용(`databases.query`) |
| 런타임에 노션 API 직접 호출 | 속도 저하 및 노션 이미지 URL 1시간 만료 문제 |
| 노션 이미지 URL을 `<img src>`에 그대로 사용 | 1시간 후 링크가 깨짐 — 반드시 로컬 다운로드 + sharp 처리 후 사용 |
| `public/data/`, `public/images/nail/`를 직접 git 커밋 | GitHub Actions가 `git add -f`로 자동 커밋 — 로컬에서는 `.gitignore`에 포함 |
| 에러를 무시하고 진행 (Silently fail) | fetch 실패 시 반드시 에러 로깅 후 `process.exit(1)` |
| 요청 범위(현재 Plan) 초과 작업 | 오버엔지니어링 방지 — 현재 파일의 목표만 달성할 것 |

---

## 핵심 아키텍처 결정

- **데이터:** `scripts/fetch-notion.ts` → `public/data/nailarts.json` + `public/images/nail/*.webp`
- **이미지:** sharp로 750px 리사이즈 + WebP q85 변환. 커버는 가격대별 크롭 (39/59아트: 5:2 center, 79아트: 5:2.5 top)
- **렌더링:** Next.js App Router, `generateStaticParams` 사용한 100% 정적 렌더링
- **배포:** Vercel (GitHub 연동, push 시 자동 배포) + GitHub Actions (매일 KST 06:00 노션 데이터 동기화)

---

## 디자인 스킬 참조

비주얼 작업(005-visual-design) 시 `docs/skills/supanova/redesign-skill/SKILL.md`를 참조한다.
스킬 원칙은 Next.js 방식으로 적용 (standalone HTML 출력 아님).

---

## Exec-plans 목록 (모두 완료)

```
001-init-structure      폴더/파일 구조 + 문서 세팅                          ✅
002-fetch-script        노션 fetch 스크립트 및 이미지 다운로더 구현          ✅
003-static-render       Next.js 정적 렌더링(SSG) 뷰 구현                   ✅
004-filter-sort         테마 탭 + 가격 버튼 네비게이션 구현                  ✅
005-visual-design       Supanova 스킬 적용 + B&W 스타일링                  ✅
006-github-actions      GitHub Actions + Vercel 자동 배포 파이프라인        ✅
