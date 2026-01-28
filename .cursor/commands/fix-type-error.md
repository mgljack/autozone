# Fix Type Error

TypeScript 타입 에러를 수정합니다.

## 일반적인 에러 패턴

### 1. 'any' 타입 사용
```typescript
// ❌ 잘못된 예
const data: any = response;

// ✅ 올바른 예
interface ResponseData {
  id: string;
  name: string;
}
const data: ResponseData = response;
```

### 2. null/undefined 체크
```typescript
// ❌ 잘못된 예
const value = obj.property.nested;

// ✅ 올바른 예
const value = obj?.property?.nested;
// 또는
if (obj && obj.property) {
  const value = obj.property.nested;
}
```

### 3. 이벤트 타입
```typescript
// ❌ 잘못된 예
const handleClick = (e) => { };

// ✅ 올바른 예
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => { };
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { };
```

### 4. useQuery 타입
```typescript
// ✅ 올바른 예
const { data } = useQuery<CarListItemDTO[]>({
  queryKey: ["cars"],
  queryFn: fetchCars,
});
```

## 타입 정의 위치
- API 응답 타입: `src/lib/apiTypes.ts`
- 도메인 타입: `src/features/{domain}/types.ts`

