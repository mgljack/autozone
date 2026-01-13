"use client";

import Image from "next/image";
import Link from "next/link";

import { formatMnt } from "@/lib/format";
import type { PartListItemDTO } from "@/lib/apiTypes";

export function PartCard({ part }: { part: PartListItemDTO }) {
  const imageUrl = part.thumbnailUrl || "/samples/cars/car-01.svg";

  return (
    <Link
      href={`/buy/parts/${part.id}`}
      className="group block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
        <Image src={imageUrl} alt={part.name} fill className="object-cover" />
      </div>
      <div className="p-4">
        <div className="text-base font-normal text-zinc-900">{part.name}</div>
        {part.forModel ? (
          <div className="mt-1 text-sm text-zinc-600">
            {part.forManufacturer ? `${part.forManufacturer} ` : ""}
            {part.forModel}
          </div>
        ) : null}
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600">
            {part.condition === "new" ? "신품" : "중고"}
          </span>
          <div className="text-lg font-extrabold text-zinc-900">{formatMnt(part.priceMnt)}</div>
        </div>
      </div>
    </Link>
  );
}

