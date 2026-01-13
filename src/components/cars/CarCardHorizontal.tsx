"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { formatMnt } from "@/lib/format";
import { useFavorites, type FavoriteItem } from "@/features/favorites/favorites";
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
      className="group block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[360px_1fr_220px] md:items-start">
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
              className="grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white"
              aria-label="Favorite"
              aria-pressed={favored}
              onClick={onFavoriteClick}
            >
              <span className="text-lg">{favored ? "♥" : "♡"}</span>
            </button>
          </div>
        </div>

        {/* CENTER: Title + meta + tags */}
        <div className="min-w-0">
          <div className="text-lg font-normal text-zinc-900">{car.title}</div>
          {metaLine ? (
            <div className="mt-1 text-sm text-zinc-600">{metaLine}</div>
          ) : null}
          
          {/* Tags row */}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600">
              {car.tier.toUpperCase()}
            </span>
          </div>
        </div>

        {/* RIGHT: Price */}
        <div className="flex flex-col items-end gap-2 md:items-end">
          <div className="text-right text-lg font-extrabold text-zinc-900">{formatMnt(car.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}


