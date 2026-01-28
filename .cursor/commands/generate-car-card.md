# Generate Car Card

차량 카드 컴포넌트 패턴입니다.

## 기본 카드 (CarCard)

```tsx
import Link from "next/link";
import Image from "next/image";
import { formatMnt, formatKm } from "@/lib/format";
import { PremiumTierBadge } from "@/components/badges/PremiumTierBadge";
import type { CarListItemDTO } from "@/lib/apiTypes";

interface CarCardProps {
  car: CarListItemDTO;
}

export function CarCard({ car }: CarCardProps) {
  const cover = car.thumbnailUrl ?? "/samples/cars/car-01.svg";
  
  return (
    <Link
      href={`/buy/all/${car.id}`}
      className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-36">
        <Image src={cover} alt={car.title} fill className="object-cover" />
        {(car.tier === "gold" || car.tier === "silver") && (
          <PremiumTierBadge tier={car.tier} />
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-medium text-zinc-900">
          {car.title}
        </div>
        <div className="mt-1 text-xs text-zinc-600">
          {car.yearMade}년 • {car.regionLabel} • {formatKm(car.mileageKm)}
        </div>
        <div className="mt-1.5 text-sm font-bold text-zinc-900">
          {formatMnt(car.priceMnt)}
        </div>
      </div>
    </Link>
  );
}
```

## 수평 카드 (CarCardHorizontal)

위치: `src/components/cars/CarCardHorizontal.tsx`

## 그리드 사용

```tsx
<div className="grid gap-4 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
  {cars.map(car => <CarCard key={car.id} car={car} />)}
</div>
```

