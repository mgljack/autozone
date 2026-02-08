"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { formatMnt } from "@/lib/format";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTime";
import { useFavorites, type FavoriteItem } from "@/features/favorites/favorites";
import { PremiumTierBadge } from "@/components/badges/PremiumTierBadge";
import { LikeIcon } from "@/components/ui/LikeIcon";
import { cn } from "@/lib/utils";
import type { CarListItemDTO } from "@/lib/apiTypes";

export function CarCardHorizontal({ car, href }: { car: CarListItemDTO; href?: string }) {
  const cover = car.thumbnailUrl ?? "/samples/cars/car-01.svg";
  // Use images array if available, otherwise use thumbnailUrl for both slots
  const images = car.images && car.images.length > 0 
    ? [car.images[0], car.images[1] ?? car.images[0]]
    : [cover, cover];
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const favored = isFavorite(car.id);
  const favItem: FavoriteItem = React.useMemo(
    () => ({
      id: car.id,
      title: car.title,
      priceMnt: car.priceMnt,
      image: cover,
      createdAt: car.createdAt,
    }),
    [car.createdAt, car.id, car.priceMnt, car.title, cover],
  );

  const onFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(car.id, favItem);
  };

  // Format meta information
  const yearText = car.yearMade && car.yearImported 
    ? `${car.yearMade}/${car.yearImported}`
    : car.yearMade || car.yearImported || "";
  const metaLine = [yearText, `${car.mileageKm.toLocaleString("mn-MN")}km`, car.regionLabel].filter(Boolean).join(" · ");

  const detailHref = href ?? `/buy/all/${car.id}`;

  return (
    <Link
      href={detailHref}
      className="group block w-full border-b border-slate-200/70 py-4 transition-colors hover:bg-slate-50/60 last:border-b-0"
    >
      <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-[360px_1fr_220px] md:items-start">
        {/* LEFT: Two images */}
        <div className="relative grid grid-cols-2 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative h-[120px] w-full overflow-hidden rounded-xl bg-zinc-100">
              <Image src={img} alt={`${car.title} ${idx + 1}`} fill className="object-cover" />
            </div>
          ))}
          
          {/* Favorite icon overlay */}
          <div className="absolute right-2 top-2 z-10">
            <button
              type="button"
              className={cn(
                "grid h-7 w-7 place-items-center rounded-full shadow-sm transition-all duration-150 hover:scale-105 border",
                favored
                  ? "bg-rose-600 border-rose-600 hover:bg-rose-700 hover:border-rose-700"
                  : "bg-zinc-500 border-zinc-500 hover:bg-zinc-600 hover:border-zinc-600"
              )}
              aria-label="Favorite"
              aria-pressed={favored}
              onClick={onFavoriteClick}
            >
              <LikeIcon liked={favored} size="sm" />
            </button>
          </div>
        </div>

        {/* CENTER: Title + meta + tags */}
        <div className="min-w-0 flex flex-col">
          {/* Header row: Title + Badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
          <div className="text-lg font-normal text-zinc-900">{car.title}</div>
            </div>
          </div>
          
          {metaLine ? (
            <div className="mt-1 text-sm text-zinc-600">{metaLine}</div>
          ) : null}
          {car.createdAt && (
            <div className="mt-1 text-xs text-zinc-500">
              {formatRelativeTimeKo(car.createdAt)}
            </div>
          )}
          
          {/* Tier Badge - only for GOLD/SILVER */}
          {(car.tier === "gold" || car.tier === "silver") && (
            <div className="mt-2">
              <PremiumTierBadge tier={car.tier} placement="right" />
          </div>
          )}
        </div>

        {/* RIGHT: Price */}
        <div className="flex flex-col items-end gap-2 md:items-end">
          <div className="text-right text-lg font-extrabold text-zinc-900">{formatMnt(car.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}


