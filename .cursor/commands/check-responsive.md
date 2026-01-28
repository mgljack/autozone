# Check Responsive

컴포넌트/페이지의 반응형 디자인을 점검합니다.

## Tailwind CSS 브레이크포인트

| 접두사 | 최소 너비 | CSS |
|--------|----------|-----|
| `sm:` | 640px | `@media (min-width: 640px)` |
| `md:` | 768px | `@media (min-width: 768px)` |
| `lg:` | 1024px | `@media (min-width: 1024px)` |
| `xl:` | 1280px | `@media (min-width: 1280px)` |
| `2xl:` | 1536px | `@media (min-width: 1536px)` |

## 체크리스트

### 레이아웃
- [ ] 모바일에서 단일 컬럼
- [ ] 태블릿에서 2컬럼 (필요 시)
- [ ] 데스크톱에서 3-4컬럼

### 타이포그래피
- [ ] 모바일에서 적절한 폰트 크기
- [ ] 제목은 `text-xl sm:text-2xl lg:text-3xl` 패턴

### 간격
- [ ] 패딩/마진 반응형 (`px-4 sm:px-6 lg:px-8`)
- [ ] 그리드 갭 반응형 (`gap-4 sm:gap-6`)

### 컴포넌트
- [ ] 카드: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- [ ] 사이드바: 모바일에서 숨김/슬라이드
- [ ] 네비게이션: 모바일 메뉴 지원

## 예시

```tsx
<div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

