# 010-custom-track-and-upload

## 목표

`/book/custom` 화면과 `/api/upload` 라우트(Notion File Upload API 프록시)를 구현하여 트랙B(커스텀 이미지) 입력을 완성한다.

## 배경

- PRD §4.3, §7.이미지 업로드
- 단일 파일 ≤ 20MB, 한 건당 ≤ 5장, MIME: jpeg/png/webp/heic
- **`file_upload_id`는 발급 후 1시간 내** page/block에 attach해야 함 → 가드 필요

## 작업 목록

### A. 업로드 API
- [x] `app/api/upload/route.ts` — `POST` + `runtime = 'nodejs'` + `dynamic = 'force-dynamic'`
- [x] 사전 검증: 20MB, MIME(jpeg/png/webp/heic/heif) 화이트리스트
- [x] 2-step 흐름: file_uploads create → presigned upload_url에 multipart POST
- [x] 단계별 console.error 로깅 + 한국어 사용자 메시지(`{ error }`)
- [x] `fetch` 직접 호출 (SDK 미지원 — plan 007 확인)

### B. 커스텀 입력 화면
- [x] `app/book/custom/page.tsx` — 클라이언트 컴포넌트, sessionStorage 복원
- [x] `app/components/booking/ImageUploader.tsx`
  - 파일 선택(`<input type="file" multiple>`)
  - 클라이언트 사전 검증: 5장 카운트(remaining 계산), 20MB
  - `/api/upload` 병렬 호출 + 스피너/에러 인디케이터
  - `previewDataUrl`(FileReader) + `fileUploadId` 보존
  - 썸네일 그리드(3열) + 개별 ✕ 삭제 + 진행/에러 카운터
- [x] 디자인 메모 textarea (max 500)
- [x] 첫 이미지 업로드 시점에 `uploadedAt = Date.now()` 기록, 전부 삭제 시 undefined 복원
- [x] 좌상단 ← → `/book`
- [x] 하단 다음 버튼 → `/book/contact` — 0장 + 메모만이라도 통과

### C. 1시간 TTL 가드
- [x] `lib/booking/uploadGuard.ts` — `isExpiringSoon`(50분 경과), `isExpired`(60분), TTL 상수 export
- [x] custom 페이지에 50분 경과 시 노란 경고 배너 + "업로드 초기화" 버튼 (contact 페이지는 plan 011에서 동일 적용)

### D. 검증
- [x] 5장 초과 시 앞에서 N장만 추가 + 안내 메시지
- [x] 20MB 초과 파일 차단 + 안내
- [x] HEIC accept 포함(`image/heic,image/heif`) — 브라우저 preview 실패 시 파일명 fallback
- [x] 네트워크/서버 에러 시 해당 슬롯에 메시지 + "제거" 버튼 → 재시도 가능

## 완료 조건

- [x] `npm run build` 통과 — 120/120 (`/api/upload` ƒ Dynamic, `/book/custom` ○ Static)
- [x] 기존 룩북 페이지 무회귀
- [x] 50분 경과 시 경고 (헬퍼 단위 검증, 수동 E2E는 plan 013)
- [ ] **실제 노션 file_upload 호출 검증은 dev server에서 1회 수행 필요** (`npm run dev` → `/book/custom` 1장 업로드 → 노션 신규 DB 페이지 attach 확인) — plan 013 통합 검증 시 수행

## 상태

`done` (2026-04-24)
