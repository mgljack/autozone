# Add Mock Data

Mock 데이터를 추가합니다 (백엔드 연동 전).

## 파일 위치
- `src/mock/cars.ts` - 차량 데이터
- `src/mock/rent.ts` - 렌탈 데이터
- `src/mock/centers.ts` - 서비스 센터 데이터
- `src/mock/media.ts` - 미디어 데이터
- `src/mock/users.ts` - 사용자 데이터
- `src/mock/taxonomy.ts` - 분류 데이터 (제조사, 모델 등)

## 차량 데이터 구조

```typescript
interface CarListItemDTO {
  id: string;
  title: string;
  thumbnailUrl: string;
  manufacturer: string;
  model: string;
  subModel?: string;
  yearMade: number;
  yearImported?: number;
  mileageKm: number;
  priceMnt: number;
  fuelType: "gasoline" | "diesel" | "lpg" | "electric" | "hybrid";
  transmission: "at" | "mt";
  color: string;
  regionCode: "ulaanbaatar" | "erdenet" | "darkhan" | "other";
  regionLabel: string;
  tier: "gold" | "silver" | "general";
  status: "published" | "reviewing" | "rejected" | "expired" | "deleted";
  createdAt: string;
  expiresAt?: string;
}
```

## API 함수 위치
`src/lib/mockApi.ts`

