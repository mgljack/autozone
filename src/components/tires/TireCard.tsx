"use client";

import Image from "next/image";
import Link from "next/link";

import { formatMnt } from "@/lib/format";
import type { TireListItemDTO } from "@/lib/apiTypes";

export function TireCard({ tire }: { tire: TireListItemDTO }) {
  const imageUrl = tire.thumbnailUrl || "/samples/cars/car-01.svg";

  const seasonLabels: Record<string, string> = {
    summer: "썸머",
    winter: "윈터",
    "all-season": "올시즌",
    "off-road": "오프로드",
  };
  const seasonLabel = seasonLabels[tire.season] || tire.season;

  // Meta line: season + DOT year + installation status
  const metaParts = [
    seasonLabel,
    tire.dotYear ? `DOT ${tire.dotYear}` : null,
    tire.installationIncluded ? "장착 포함" : null,
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
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600">
            {tire.condition === "new" ? "신품" : "중고"}
          </span>
          <div className="text-lg font-extrabold text-zinc-900">{formatMnt(tire.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}

