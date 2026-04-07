# 프론트엔드 명세

## 페이지 구조

### `/` — 룩북 메인 그리드

- 전체 네일아트 목록을 그리드로 표시
- 각 카드: 커버 이미지 + 아트명 + 테마 + 가격
- 필터: 테마, 가격, 시기 (004 단계에서 구현)
- 정렬: 기본값 = 최신순 (004 단계에서 구현)

### `/art/[id]` — 아트 상세 페이지

- 커버 이미지 (크게)
- 아트명, 테마, 가격, 시기, 제안자
- 본문 블록 이미지들
- 재료 목록
- 구매 링크 (있는 경우)

## 데이터 타입

```typescript
interface NailArt {
  id: string;           // 노션 page ID
  name: string;         // 아트명
  theme: string;        // 테마
  price: string;        // 39아트 | 59아트 | 79아트
  season: string;       // 시기
  artist: string;       // 제안자
  coverImage: string;   // /images/nail/{pageId}-cover.jpg
  detailImages: string[]; // /images/nail/{pageId}-{index}.jpg
  materials: string[];
  purchaseLinks: string[];
}
```

## 컴포넌트 구조 (003 단계에서 확정)

```
app/
├── page.tsx                  # 메인 그리드
├── art/[id]/page.tsx         # 상세 페이지
└── components/
    ├── NailArtCard.tsx       # 그리드 카드
    ├── NailArtGrid.tsx       # 그리드 레이아웃
    └── FilterBar.tsx         # 필터 UI (004에서)
```

## 스타일 가이드

- Tailwind CSS 사용
- 모바일 우선 반응형
- 이미지: `next/image` 컴포넌트 사용 (로컬 경로)
