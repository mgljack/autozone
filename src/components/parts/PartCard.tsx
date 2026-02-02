"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { formatMnt } from "@/lib/format";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTime";
import { useI18n } from "@/context/I18nContext";
import { useFavorites, type FavoriteItem } from "@/features/favorites/favorites";
import { LikeIcon } from "@/components/ui/LikeIcon";
import { PremiumTierBadge } from "@/components/badges/PremiumTierBadge";
import type { PartListItemDTO } from "@/lib/apiTypes";

export function PartCard({ part, index, tier: tierProp }: { part: PartListItemDTO; index?: number; tier?: "gold" | "silver" | null }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favored = isFavorite(part.id);
  const imageUrl = part.thumbnailUrl || "/samples/cars/car-01.svg";

  const favItem: FavoriteItem = React.useMemo(
    () => ({
      id: part.id,
      title: part.name,
      priceMnt: part.priceMnt,
      image: imageUrl,
      createdAt: part.createdAt,
    }),
    [part.id, part.name, part.priceMnt, part.createdAt, imageUrl],
  );

  const onFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(part.id, favItem);
  };

  // Use tier from prop if provided, otherwise calculate from index (prototype)
  const tier = React.useMemo<"gold" | "silver" | null>(() => {
    if (tierProp !== undefined) return tierProp;
    if (index === undefined) return null;
    if (index % 7 === 0) return "gold";
    if (index % 5 === 0) return "silver";
    return null;
  }, [tierProp, index]);

  return (
    <Link
      href={`/buy/parts/${part.id}`}
      className="group block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
        <Image src={imageUrl} alt={part.name} fill className="object-cover" />
        {/* Like icon overlay */}
        <div className="absolute right-2 top-2 z-10">
          <button
            type="button"
            className="grid h-7 w-7 place-items-center rounded-full bg-zinc-500 shadow-sm transition-all duration-150 hover:scale-105 hover:bg-zinc-600"
            aria-label="Favorite"
            aria-pressed={favored}
            onClick={onFavoriteClick}
          >
            <LikeIcon liked={favored} size="sm" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 truncate text-base font-normal text-zinc-900">{part.name}</div>
          {tier && <PremiumTierBadge tier={tier} placement="right" />}
        </div>
        {part.forModel ? (
          <div className="mt-1 text-sm text-zinc-600">
            {part.forManufacturer ? `${part.forManufacturer} ` : ""}
            {part.forModel}
          </div>
        ) : null}
        {part.createdAt && (
          <div className="mt-1 text-xs text-zinc-500">
            {formatRelativeTimeKo(part.createdAt)}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600">
            {part.condition === "new" ? t("parts_specs_condition_new") : t("parts_specs_condition_used")}
          </span>
          <div className="text-lg font-extrabold text-zinc-900">{formatMnt(part.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}

