"use client";

import Image from "next/image";
import Link from "next/link";

import { formatKm, formatMnt } from "@/lib/format";
import { useI18n } from "@/context/I18nContext";
import type { RentItem } from "@/mock/rent";

export function RentCard({ item }: { item: RentItem }) {
  const { t } = useI18n();
  const imageUrl = item.image || "/samples/cars/car-01.svg";

  const fuelLabel = item.fuel === "gasoline" ? t("rent_fuel_gasoline") : item.fuel === "diesel" ? t("rent_fuel_diesel") : item.fuel === "electric" ? t("rent_fuel_electric") : item.fuel === "hybrid" ? t("rent_fuel_hybrid") : "";
  const transmissionLabel = item.transmission === "at" ? t("rent_transmission_at") : item.transmission === "mt" ? t("rent_transmission_mt") : "";

  return (
    <Link
      href={`/rent/${item.rentType}/${item.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:border-zinc-300"
    >
      {/* Image Section - Centered and fills card space */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <Image 
          src={imageUrl} 
          alt={item.title} 
          fill 
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110" 
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
        />
      </div>
      
      {/* Details Section */}
      <div className="flex flex-1 flex-col p-5">
        {/* Car Name */}
        <h3 className="text-xl font-bold text-zinc-900">{item.title}</h3>
        
        {/* Details List */}
        <div className="mt-4 space-y-2.5 text-sm">
          {item.yearMade && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{t("rent_card_yearMade")}</span>
              <span className="font-normal text-zinc-900">{item.yearMade}{t("common_year")}</span>
            </div>
          )}
          {item.mileageKm && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{t("rent_card_mileage")}</span>
              <span className="font-normal text-zinc-900">{formatKm(item.mileageKm)}</span>
            </div>
          )}
          {fuelLabel && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{t("rent_card_fuelType")}</span>
              <span className="font-normal text-zinc-900">{fuelLabel}</span>
            </div>
          )}
          {transmissionLabel && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">{t("rent_card_transmission")}</span>
              <span className="font-normal text-zinc-900">{transmissionLabel}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-zinc-100" />

        {/* Price and Location */}
        <div className="mt-auto flex items-end justify-between">
          <div>
            <div className="text-xs font-medium text-zinc-500">{t("rent_card_location")}</div>
            <div className="mt-1 text-sm font-normal text-zinc-700">{item.region}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-zinc-500">{t("rent_card_dailyRent")}</div>
            <div className="mt-1 text-2xl font-extrabold text-zinc-900">{formatMnt(item.pricePerDayMnt)}</div>
          </div>
        </div>
      </div>
    </Link>
  );
}

