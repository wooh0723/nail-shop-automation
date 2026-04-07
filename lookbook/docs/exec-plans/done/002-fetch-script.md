# 002-fetch-script

## 목표

노션 DB에서 데이터를 가져와 로컬에 저장하는 스크립트를 구현한다.

## 배경

- 노션 이미지 URL은 1시간 후 만료 → 반드시 로컬 다운로드
- 런타임에 노션 API 호출 금지 → 빌드 타임 전처리
- `notion.databases.query` 사용 (`dataSources.query` 금지)

## 작업 목록

- [ ] `scripts/fetch-notion.ts` 구현
  - [ ] 노션 DB 전체 페이지 쿼리 (페이지네이션 처리)
  - [ ] 각 페이지의 cover 이미지 다운로드 → `public/images/nail/{pageId}-cover.jpg`
  - [ ] 각 페이지의 본문 블록 이미지 다운로드 → `public/images/nail/{pageId}-{index}.jpg`
  - [ ] `public/data/nailarts.json` 저장
- [ ] `package.json` 에 `fetch` 스크립트 추가
- [ ] `.gitignore` 에 `public/data/`, `public/images/nail/` 추가

## 완료 조건

- [ ] `NOTION_TOKEN` + `NOTION_DATABASE_ID` 환경변수 설정 후 `npm run fetch` 실행 성공
- [ ] `public/data/nailarts.json` 생성됨 (NailArt[] 형태)
- [ ] `public/images/nail/` 에 이미지 파일들 다운로드됨
- [ ] 노션 이미지 URL이 json에 포함되지 않음 (로컬 경로만 사용)

## 입력/출력

```
입력: NOTION_TOKEN, NOTION_DATABASE_ID (환경변수)
출력:
  public/data/nailarts.json   → NailArt[] (로컬 이미지 경로 포함)
  public/images/nail/         → 다운로드된 이미지들
```

## 상태

`pending`
