"use client";

import Link from "next/link";

import type { CarListItemDTO } from "@/lib/apiTypes";
import { formatKm, formatMnt } from "@/lib/format";

export function CarImageTile({ car }: { car: CarListItemDTO }) {
  const cover = car.thumbnailUrl || "/file.svg";
  const mfgYear = car.yearMade;
  const importYear = car.yearImported;
  const years = mfgYear && importYear ? `${mfgYear}/${importYear}` : mfgYear || importYear || "";
  const mileage = car.mileageKm ? formatKm(car.mileageKm) : "";
  const metaLine = [years, mileage].filter(Boolean).join(" · ");

  return (
    <Link href={`/buy/all/${car.id}`} className="block overflow-hidden rounded-2xl border border-zinc-200 bg-white hover:border-zinc-300 transition-colors">
      <div className="relative h-[140px] w-full bg-zinc-100 sm:h-[160px]">
        <img src={cover} alt={car.title} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <div className="text-[18px] font-extrabold leading-tight">{formatMnt(car.priceMnt)}</div>
        <div className="mt-1 truncate text-sm font-normal text-zinc-900">{car.title}</div>
        {metaLine ? <div className="mt-1 text-xs text-zinc-600">{metaLine}</div> : null}
      </div>
    </Link>
  );
}

