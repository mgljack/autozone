"use client";

import Image from "next/image";
import Link from "next/link";

import { formatMnt } from "@/lib/format";
import { useI18n } from "@/context/I18nContext";
import type { CenterDTO } from "@/lib/apiTypes";

export function ServiceCenterCardHorizontal({ center }: { center: CenterDTO }) {
  const { t } = useI18n();
  const imageUrl = center.imageUrl || "/samples/cars/car-01.svg";

  return (
    <Link
      href={`/service/center/${center.id}`}
      className="group block w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[360px_1fr_220px] md:items-start">
        {/* LEFT: Single service center image */}
        <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-zinc-100 md:h-[160px]">
          <Image 
            src={imageUrl} 
            alt={center.name} 
            fill 
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105" 
            sizes="(max-width: 768px) 100vw, 360px"
          />
        </div>

        {/* CENTER: Service center details */}
        <div className="min-w-0">
          {/* Service Center Name */}
          <div className="text-lg font-normal text-zinc-900">{center.name}</div>
          
          {/* Location */}
          <div className="mt-1 text-sm text-zinc-600">
            <span>{center.regionLabel}</span>
          </div>
          
          {/* Address */}
          <div className="mt-2 text-sm text-zinc-600">{center.address}</div>
          
          {/* Service Types */}
          <div className="mt-3 flex flex-wrap gap-2">
            {center.services.map((service) => (
              <span
                key={service}
                className="rounded-full border border-zinc-200 px-2 py-1 text-xs font-normal text-zinc-600"
              >
                {service}
              </span>
            ))}
          </div>

          {/* Operating hours */}
          {center.operatingHours && (
            <div className="mt-3 text-xs text-zinc-500">{t("service_card_operatingHours")} {center.operatingHours}</div>
          )}
        </div>

        {/* RIGHT: Price */}
        <div className="flex flex-col items-end gap-3 md:items-end">
          {center.minPriceMnt && center.maxPriceMnt && (
            <div className="mt-auto text-right">
              <div className="text-xs text-zinc-500">{t("service_card_servicePrice")}</div>
              <div className="mt-1 text-lg font-extrabold text-zinc-900">
                {center.minPriceMnt === center.maxPriceMnt 
                  ? formatMnt(center.minPriceMnt)
                  : `${formatMnt(center.minPriceMnt)} ~ ${formatMnt(center.maxPriceMnt)}`}
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="text-xs text-zinc-500">{t("service_card_contact")}</div>
            <div className="mt-1 text-sm font-normal text-zinc-900">{center.phone}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

