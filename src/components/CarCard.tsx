"use client";

import Link from "next/link";

import { useFavorites } from "@/features/favorites/favorites";
import { LikeIcon } from "@/components/ui/LikeIcon";
import type { Car } from "@/lib/api/cars";
import { formatKm, formatMnt } from "@/lib/format";

export function CarCard({ car }: { car: Car }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favored = isFavorite(car.id);
  const cover = car.images?.[0] || "/file.svg";

  return (
    <Link href={`/buy/all/${car.id}`} className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50">
      <div className="relative h-44 w-full bg-zinc-100">
        <img src={cover} alt={car.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <div className="block truncate text-base font-normal">{car.title}</div>
          <div className="mt-1 text-sm text-zinc-600">
            {car.year} • {formatKm(car.mileageKm)} • {car.location}
          </div>
          <div className="mt-2 text-lg font-normal">{formatMnt(car.priceMnt)}</div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(car.id, {
              id: car.id,
              title: car.title,
              priceMnt: car.priceMnt,
              image: cover,
              createdAt: car.postedAt,
            });
          }}
          className="shrink-0 flex items-center justify-center h-7 w-7 rounded-full bg-zinc-500 transition-all duration-150 hover:scale-105 hover:bg-zinc-600"
          aria-pressed={favored}
        >
          <LikeIcon liked={favored} size="sm" />
        </button>
      </div>
    </Link>
  );
}


