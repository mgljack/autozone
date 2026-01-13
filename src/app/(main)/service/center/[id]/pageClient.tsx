"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import dynamic from "next/dynamic";
import { SectionTitle } from "@/components/common/SectionTitle";
import { CenterGallery } from "@/components/service/CenterGallery";
import { Button } from "@/components/ui/button";

// Dynamic import for Leaflet map (SSR incompatible)
const CenterMap = dynamic(() => import("@/components/service/CenterMap").then((mod) => ({ default: mod.CenterMap })), {
  ssr: false,
  loading: () => (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-sm text-zinc-600">지도를 불러오는 중...</div>
      </div>
    </div>
  ),
});
import { useI18n } from "@/context/I18nContext";
import { fetchCenterById } from "@/lib/mockApi";
import { formatMnt } from "@/lib/format";
import type { CenterDTO } from "@/lib/apiTypes";

type CenterDetail = CenterDTO & {
  images?: string[];
  serviceItems?: Array<{ name: string; priceMnt: number }>;
  location?: { address: string; lat: number; lng: number };
  phoneNumbers?: string[];
  operatingHours?: string;
};

export default function ServiceCenterDetailClient({ id }: { id: string }) {
  const { t } = useI18n();

  const centerQuery = useQuery({
    queryKey: ["centers", "detail", id],
    queryFn: () => fetchCenterById(id),
  });

  if (centerQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common.loading")}</div>;
  if (!centerQuery.data) return <div className="text-sm text-zinc-600">{t("common.notFound")}</div>;

  const center = centerQuery.data as CenterDetail;
  const images = center.images?.length
    ? center.images
    : [
        center.imageUrl,
        "/samples/cars/car-01.svg",
        "/samples/cars/car-02.svg",
        "/samples/cars/car-03.svg",
        "/samples/cars/car-04.svg",
      ];

  const serviceItems =
    center.serviceItems?.length
      ? center.serviceItems
      : (center.services ?? []).map((name, idx) => ({ name, priceMnt: 20000 + idx * 15000 }));

  const loc = center.location ?? { address: center.address, lat: 47.9186, lng: 106.9176 };
  const mapsHref = `https://www.google.com/maps?q=${encodeURIComponent(`${loc.lat},${loc.lng}`)}`;

  const phoneNumbers =
    center.phoneNumbers?.length === 2
      ? center.phoneNumbers
      : ["1533-6451", center.phone || "010-0000-0000"];
  const operatingHours = center.operatingHours ?? "평일 09:00 - 18:00";

  const telHref = (raw: string) => `tel:${raw.replace(/[^\d+]/g, "")}`;
  const primaryPhone = phoneNumbers[0] ?? center.phone;

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link className="font-normal text-zinc-900 hover:underline" href="/service">
          ← {t("service.backToCenters")}
        </Link>
      </div>

      <SectionTitle title={center.name} subtitle={`${center.regionLabel} • ★ ${center.rating.toFixed(1)}`} />

      {/* Photos */}
      <CenterGallery images={images} title={center.name} />

      {/* Contact bar under photos (horizontal like reference) */}
      <div className="pt-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="text-sm text-zinc-600">
            운영시간 <span className="font-medium text-zinc-900">{operatingHours}</span>
          </div>
          <a href={telHref(primaryPhone)} className="block">
            <Button size="lg" className="h-12 w-full px-6 sm:w-auto sm:min-w-[240px]">
              <span className="mr-2 inline-flex">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path
                    d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.5 2.6.6a2 2 0 0 1 1.7 2Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {primaryPhone}
            </Button>
          </a>
        </div>
      </div>

      {/* Services */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">서비스 / 가격</div>
        <div className="mt-4 grid gap-2">
          {serviceItems.map((s) => (
            <div key={s.name} className="flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
              <div className="text-sm font-normal text-zinc-700">{s.name}</div>
              <div className="text-sm font-extrabold text-zinc-900">{formatMnt(s.priceMnt)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-normal text-zinc-900">위치</div>
          <a href={mapsHref} target="_blank" rel="noreferrer noopener">
            <Button variant="outline">지도에서 보기</Button>
          </a>
        </div>

        <div className="mt-3">
          <CenterMap lat={loc.lat} lng={loc.lng} centerName={center.name} address={loc.address} />
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
            <div className="font-normal text-zinc-900">{loc.address}</div>
            <div className="mt-1 text-xs text-zinc-500">
              lat {loc.lat.toFixed(5)} • lng {loc.lng.toFixed(5)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


