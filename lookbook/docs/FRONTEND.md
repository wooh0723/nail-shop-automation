# 프론트엔드 명세

## 페이지 구조

### `/` — 룩북 메인

- 헤더: "Signicho Nail" 브랜드명(좌) + 시기 드롭다운(우)
- 테마 탭: 테마별 필터 (ThemeTabs)
- 가격 스위처: 39아트 / 59아트 / 79아트 버튼 (PriceSwiper)
- 카드 리스트: 커버 이미지 + 아트명, stagger fade-in 애니메이션
- 테마 변경 시 선택된 가격 유지

### `/art/[id]` — 아트 상세 페이지

- "← lookbook" 뒤로가기 링크
- 커버 이미지 (전체 너비)
- 아트명, 테마, 가격, 시기, 제안자
- 상세 이미지 그리드
- 재료 목록
- 구매 링크 (있는 경우)

## 데이터 타입

```typescript
interface NailArt {
  id: string;             // 노션 page ID (하이픈 제거)
  name: string;           // 아트명
  theme: string;          // 테마
  price: string;          // 39아트 | 59아트 | 79아트
  season: string;         // 시기 (YYMM 형식)
  artist: string;         // 제안자
  coverImage: string;     // /images/nail/{pageId}-cover.webp
  detailImages: string[]; // /images/nail/{pageId}-{index}.webp
  materials: string[];
  purchaseLinks: string[];
}
```

## 컴포넌트 구조

```
app/
├── page.tsx                    # SSG 메인 (getNailArts → LookbookClient)
├── art/[id]/page.tsx           # SSG 상세 (generateStaticParams)
├── layout.tsx                  # 루트 레이아웃
├── globals.css                 # B&W 스타일 + 애니메이션
└── components/
    ├── LookbookClient.tsx      # 메인 클라이언트 (테마/가격/시기 상태 관리)
    ├── NailArtCard.tsx         # 카드 (5:2 비율, 79아트는 5:2.5)
    ├── PriceSwiper.tsx         # 가격 버튼 스위처 (nudge 애니메이션)
    └── ThemeTabs.tsx           # 테마 탭 (스크롤 가능)
```

## 이미지 처리

- 빌드 타임에 sharp로 처리 (fetch-notion.ts)
- 전체: 가로 750px 리사이즈 + WebP q85
- 커버 크롭: 39/59아트 → 5:2 center, 79아트 → 5:2.5 top (손톱 끝 보존)
- Next.js Image: `sizes="390px"`, `quality={85}`
- `next.config.ts`: `deviceSizes: [390]`, `imageSizes: [390]`

## 스타일 가이드

- Tailwind CSS 4
- 모바일 퍼스트 (390px 기준)
- B&W 톤 (#0a0a0a, #fafafa, #aaa, #bbb, #ddd)
- 폰트: Pretendard, 브랜드명은 Cormorant Garamond
- 애니메이션: stagger fade-in, nudge hint, magnetic button
- grain 텍스처 오버레이
