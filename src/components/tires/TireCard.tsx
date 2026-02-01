"use client";

import Image from "next/image";
import Link from "next/link";

import { formatMnt } from "@/lib/format";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTime";
import { useI18n } from "@/context/I18nContext";
import type { TireListItemDTO } from "@/lib/apiTypes";

export function TireCard({ tire }: { tire: TireListItemDTO }) {
  const { t } = useI18n();
  const imageUrl = tire.thumbnailUrl || "/samples/cars/car-01.svg";

  const getSeasonLabel = (season: string): string => {
    const seasonKeyMap: Record<string, string> = {
      summer: "tire_filters_season_summer",
      winter: "tire_filters_season_winter",
      "all-season": "tire_filters_season_allSeason",
      "off-road": "tire_filters_season_offRoad",
    };
    return t(seasonKeyMap[season] || season);
  };
  const seasonLabel = getSeasonLabel(tire.season);

  // Meta line: season + DOT year + installation status
  const metaParts = [
    seasonLabel,
    tire.dotYear ? `DOT ${tire.dotYear}` : null,
    tire.installationIncluded ? t("tire_card_installationIncluded") : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/buy/tire/${tire.id}`}
      className="group block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
        <Image src={imageUrl} alt={`${tire.brand} ${tire.size}`} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="text-base font-normal text-zinc-900">
          {tire.brand} {tire.size}
        </div>
        {metaParts.length > 0 ? (
          <div className="mt-1 text-sm text-zinc-600">{metaParts.join(" · ")}</div>
        ) : null}
        {tire.createdAt && (
          <div className="mt-1 text-xs text-zinc-500">
            {formatRelativeTimeKo(tire.createdAt)}
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600">
            {tire.condition === "new" ? t("tire_specs_condition_new") : t("tire_specs_condition_used")}
          </span>
          <div className="text-lg font-extrabold text-zinc-900">{formatMnt(tire.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}

