# PRD — 네일아트 예약 상담 수집 플로우

## 1. 배경 & 목적

예약이 **이미 확정된** 고객에게 매니저가 SMS로 링크를 발송한다. 고객은 방문 전 희망 네일아트 디자인 정보(기존 이달의 아트 중 선택 or 참고 이미지 기반 커스텀)와 기본 예약자 정보를 제출한다. 수집 정보는 노션 DB에 자동 적재되어 매니저가 방문 전 준비·상담 효율을 높일 수 있게 한다.

## 2. 대상 & 맥락

- **사용자**: 예약 확정 고객 (공개 유입 아님)
- **진입**: SMS 링크 클릭 — 모바일 우선
- **수량**: 1 링크 = 최대 여러 명 접수 (동반 방문자 대응)

## 3. 전체 플로우

```
[SMS 링크] → /book
    │
    ├─ A. 시그니초 이달의 아트 희망
    │     → 룩북(선택모드, /?mode=select)
    │     → 카드 클릭 → [선택 확인 팝업 + 변형 메모(선택)]
    │
    └─ B. 원하는 디자인 있음
          → [이미지 업로드(최대 5장) + 메모]
    │
    └───────┬──────────────────────────────────────────
            ↓
[예약자 정보 입력 화면]
  - 상단: 앞단계 선택 요약(썸네일/메모) + 변경 버튼
  - 입력: 지점 · 이름 · 연락처 · 공통 메모
            ↓
         [제출]
            ↓
[제출 완료]
  ├─ "한 분 더 신청" → /book 으로 복귀 (상태 리셋)
  └─ "닫기"
            ↓
    Notion DB 신규 row 생성
```

## 4. 화면 스펙

### 4.1 `/book` — 분기 선택

- 헤더: 안내 카피 (예: "방문 전 희망 디자인을 알려주세요")
- 풀폭 버튼 2개
  - `시그니초 이달의 아트가 좋아요` → `/?mode=select`
  - `원하는 디자인이 따로 있어요` → `/book/custom`
- 뒤로가기 미노출 (진입점)

### 4.2 `/?mode=select` — 룩북 선택모드

- 기존 룩북 UI 그대로 유지 (NAIL/PEDI · 테마 · 가격 · 시기)
- **`mode=select`일 때만** 카드 클릭 활성화
  - 일반 진입(`/`)은 기존 동작 유지 — 회귀 금지
- 좌상단 ← 아이콘 → `/book` 복귀
- 상단 고정 배너: "마음에 드는 아트를 선택해주세요"

#### 4.2.1 선택 확인 팝업 (모달)

- 선택 아트 커버 + 이름 + 가격 표시
- 변형 요청 메모 입력란 (선택, 1줄)
  - placeholder 예: `컬러만 누드톤으로`
- 버튼: `취소` / `이 아트로 진행` → `/book/contact`

### 4.3 `/book/custom` — 커스텀 입력

- 이미지 업로더
  - 최대 5장, 장당 10MB, jpg/png/webp/heic
  - 썸네일 미리보기 + 개별 삭제
- 디자인 메모 (textarea)
- 좌상단 ← → `/book`
- 하단 `다음` 버튼 → `/book/contact`
  - 이미지 0장이어도 통과 허용 (메모만 있어도 접수)

### 4.4 `/book/contact` — 예약자 정보

- 상단 **요약 카드**
  - 트랙 A: 선택 아트 썸네일 + 이름 + 변형 메모
  - 트랙 B: 업로드 이미지 썸네일 그리드 + 메모 요약
  - `변경` 버튼 → 해당 이전 단계로 (값 유지)
- 입력
  - `지점명` — 드롭다운(5개 지점), 필수
  - `이름` — text, 필수
  - `연락처` — tel, 필수, 국내 휴대폰 형식 검증
  - `공통 메모` — textarea, 선택
- `제출` 버튼 — 전송 중 disabled + 스피너

### 4.5 `/book/done` — 제출 완료

- "접수 완료" 메시지 + 안내 문구 ("방문 전 준비에 활용됩니다")
- 버튼
  - `한 분 더 신청하기` → `/book` (sessionStorage 초기화)
  - `닫기`

## 5. 네비게이션 & 상태 관리

- 모든 단계 좌상단에 ← 뒤로가기 아이콘 (진입점 `/book` 제외)
- 뒤로가면 **이전 입력값 유지**
- `sessionStorage` 키: `signicho-booking-draft`

```ts
type BookingDraft = {
  track: "existing" | "custom" | null;
  existing?: { artId: string; artName: string; coverImage: string; variationMemo: string };
  custom?: {
    // 업로드 완료된 파일 핸들 (Notion File Upload API 반환값)
    images: { fileUploadId: string; filename: string; previewDataUrl?: string }[];
    memo: string;
  };
  contact?: { branch: string; name: string; phone: string; memo: string };
};
```

- 페이지 이동/새로고침 시 복원
- 제출 성공 또는 "한 분 더" 선택 시 clear

## 6. 데이터 모델 — 노션 신규 DB "예약 상담 요청"

| 프로퍼티 | 타입 | 필수 | 비고 |
|---|---|---|---|
| 요청번호 | title | ✓ | `REQ-YYYYMMDD-HHmmss-xxxx` 자동생성 |
| 상태 | status | | 기본 `신규` — 확인완료 / 취소 |
| 트랙 | select | ✓ | `기존아트` / `커스텀` |
| 선호 아트 | relation | | 기존 네일아트 DB 링크 (트랙A 전용) |
| 변형 메모 | rich_text | | 트랙A 팝업 입력 |
| 참고 이미지 | files | | 트랙B 업로드 (Notion File Upload, 복수) — 선택 적용 |
| 디자인 메모 | rich_text | | 트랙B 입력 |
| 지점 | select | ✓ | 5개 지점 옵션 |
| 이름 | rich_text | ✓ | |
| 연락처 | phone_number | ✓ | |
| 공통 메모 | rich_text | | |
| 제출일시 | created_time | | 자동 |

## 7. 기술 스펙

### 아키텍처
- 기존 Next.js 15 (App Router) SSG 구조 유지
- 신규 경로: `/book`, `/book/custom`, `/book/contact`, `/book/done`
- 신규 API 라우트
  - `app/api/booking/route.ts` — POST, 노션 `pages.create` + 본문 image 블록 append
  - `app/api/upload/route.ts` — POST, **Notion File Upload API 프록시** (1장씩 호출)
- **쓰기 API 런타임 호출 OK** — 기존 "읽기 금지(이미지 1시간 만료)" 원칙은 쓰기와 무관

### 이미지 업로드 — Notion File Upload API (Vercel Blob 미사용)

**이유**: Vercel Blob은 유료 기능. Notion의 네이티브 File Upload API(2024 GA)는 무료 워크스페이스에서도 동작하며 추가 스토리지 비용·의존성 없음.

**서버 플로우 (`/api/upload`)**:
```
1) POST https://api.notion.com/v1/file_uploads
   headers: Authorization: Bearer {NOTION_TOKEN}, Notion-Version: 2022-06-28
   body: { filename, content_type }
   → { id, upload_url }

2) POST {upload_url}
   Content-Type: multipart/form-data
   field: file (바이너리)
   → 업로드 완료 (file_upload_id 확정)

3) 클라이언트에 { fileUploadId, filename } 반환
   → sessionStorage 저장 (제출 시점에 페이지 생성과 함께 참조)
```

**제출 시 (`/api/booking`)**:
- `pages.create`로 DB row 생성 (props 매핑)
- 트랙B인 경우 **페이지 본문에 image 블록 append** (`blocks.children.append`)
  ```ts
  { type: "image", image: { type: "file_upload", file_upload_id } }
  ```
- (선택) DB의 `files` 프로퍼티에도 동일 `file_upload_id` 참조 추가 — 한 번 업로드로 두 위치 모두 활용 가능

**제한**
- 단일 파일 ≤ 20MB (클라이언트에서 사전 검증)
- 허용 MIME: image/jpeg, image/png, image/webp, image/heic
- 한 건당 최대 5장 — 클라이언트에서 카운트 제한
- `file_upload_id`는 생성 후 **1시간 내** 블록/파일프로퍼티에 attach해야 함 → 제출 시점에 즉시 page 생성해야 함 (드래프트로 오래 방치 주의)

### next.config.ts
- `output: 'export'` 설정 존재 시 **제거 필요** (Route Handler가 빌드에서 빠짐)
- 기존 GitHub Actions → Vercel 배포 파이프라인 그대로 활용

### 환경변수 (신규)
- `NOTION_BOOKING_DATABASE_ID` — 신규 상담 요청 DB
- 기존 `NOTION_TOKEN` 재사용 (파일 업로드/페이지 생성 모두 동일 토큰)
- 로컬: `.env.local`, GitHub Actions: Secrets에 동일 등록

### 의존성 (신규)
- `react-hook-form` + `zod` + `@hookform/resolvers`
- `@notionhq/client` (기존) — 페이지/블록 생성용
- File Upload API는 SDK v2.2.15+ 의 `fileUploads.create`, 미지원 시 `fetch`로 직접 호출

## 8. 디자인 원칙

- 기존 B&W 톤앤매너 유지 (`globals.css` 팔레트/폰트 그대로)
- `Cormorant Garamond` 타이틀 / 기본 시스템 산세리프 본문 유지
- 모바일 우선 — `max-w-[390px]` 컨테이너 공통
- 터치 타겟 최소 높이 48px
- 팝업/모달은 중앙 고정, 반투명 딤 처리
- 페이지 전환 시 `stagger-reveal` 애니메이션 재활용

## 9. 검증 기준 (Acceptance)

- [ ] SMS 링크(`/book`)로 진입 시 분기 버튼 2개 노출
- [ ] 트랙A: 카드 클릭 → 팝업 → 변형 메모 입력 → `/book/contact`에 아트 요약 표시
- [ ] 트랙B: 이미지 5장 업로드 + 메모 → `/book/contact`에 썸네일/메모 요약 표시
- [ ] 뒤로가기(←) 시 직전 입력값 유지
- [ ] 새로고침해도 sessionStorage 복원으로 입력값 유지
- [ ] 필수 필드 미입력 시 Zod 에러 노출, 제출 차단
- [ ] 제출 성공 시 노션 DB에 신규 row 생성 (트랙/이미지/지점 등 매핑 확인)
- [ ] 제출 완료 화면 → "한 분 더" → `/book`, 이전 값 전부 리셋
- [ ] 일반 룩북 진입(`/`, `mode` 파라미터 없음) 시 카드 클릭 비활성 유지 — 기존 동작 무회귀
- [ ] `npm run build` 통과
- [ ] 기존 KST 06:00 fetch 자동화 파이프라인 영향 없음

## 10. Out of Scope

- 공개 URL 봇/어뷰즈 방지 (확정 고객 대상이므로 생략)
- 희망 방문일 입력 (이미 예약 확정 상태)
- 매니저 Slack/이메일 즉시 알림 (차기 단계)
- 제출 이력 조회/편집, 고객 로그인
- 다국어 지원
- 기존 아트 복수 선택 (1인 1아트 원칙)

## 11. 작업 분할 힌트 (구현 세션용)

1. 환경/의존성 세팅 + 노션 DB 생성·연결 + env 등록 + `next.config.ts` 검증
2. `/book` 분기 페이지 + `useBookingDraft` sessionStorage 훅
3. 룩북 선택모드 (`?mode=select`) + 카드 클릭 팝업(모달)
4. `/book/custom` + `/api/upload` (Notion File Upload API) 라우트 — 20MB/5장 제한, 1시간 TTL 유의
5. `/book/contact` + 요약 카드 + zod 검증 폼
6. `/api/booking` (Notion `pages.create` + 본문 image 블록 append) + `/book/done`
7. 네비게이션/상태복원 E2E 확인, 기존 룩북 회귀 테스트, `npm run build`

## 12. 확인 필요한 외부 입력 (구현 시작 전 세팅)

- [ ] 5개 지점명/주소 (드롭다운 옵션 확정)
- [ ] 노션 "예약 상담 요청" DB 생성 + 인테그레이션 연결 + `NOTION_BOOKING_DATABASE_ID` 발급
- [ ] 기존 `NOTION_TOKEN`의 인테그레이션이 신규 DB에도 접근 권한 있는지 확인
- [ ] `@notionhq/client` 버전 확인 — File Upload 지원 여부(미지원 시 fetch 직접 호출)
