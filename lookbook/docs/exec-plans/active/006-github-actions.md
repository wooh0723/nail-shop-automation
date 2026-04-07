# 005-github-actions

## 목표

GitHub Actions로 노션 fetch + Vercel 배포를 자동화한다.

## 배경

- 로컬 노트북이 꺼져 있어도 동작해야 함
- 스케줄: 매일 새벽 (노션 DB 업데이트 반영)
- 수동 트리거도 가능해야 함 (`workflow_dispatch`)

## 작업 목록

- [ ] `.github/workflows/fetch-and-deploy.yml` 생성
  - [ ] 트리거: `schedule` (cron) + `workflow_dispatch`
  - [ ] steps: checkout → node 설치 → `npm run fetch` → Vercel 배포
- [ ] GitHub Secrets 설정 가이드 작성
  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

## 완료 조건

- [ ] GitHub Actions 워크플로우 파일 존재
- [ ] 수동 트리거(`workflow_dispatch`) 실행 성공
- [ ] 스케줄 트리거 설정됨 (cron 표현식 확인)
- [ ] Vercel 배포까지 파이프라인 완성

## 상태

`pending`
