# Deploy Checklist

배포 전 체크리스트입니다.

## 빌드 체크

```bash
# 빌드 테스트
npm run build

# 린트 검사
npm run lint
```

## 체크리스트

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고/에러 없음
- [ ] console.log 제거
- [ ] 주석 처리된 코드 제거

### 다국어
- [ ] 모든 UI 텍스트가 i18n 키 사용
- [ ] 새 키는 3개 언어 모두 추가 (mn, ko, en)
- [ ] 번역 누락 없음

### 반응형
- [ ] 모바일 (320px~) 테스트
- [ ] 태블릿 (768px~) 테스트
- [ ] 데스크톱 (1280px~) 테스트

### 접근성
- [ ] 이미지에 alt 텍스트
- [ ] 버튼에 aria-label (아이콘 버튼)
- [ ] 키보드 네비게이션 가능

### 성능
- [ ] 이미지 최적화 (Next.js Image 사용)
- [ ] 불필요한 리렌더링 없음
- [ ] 큰 리스트는 가상화 고려

### SEO
- [ ] 페이지별 메타데이터 설정
- [ ] Open Graph 태그 설정

## 환경 변수 (향후)

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_MAP_API_KEY=
DATABASE_URL=
```

