"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { useFavorites } from "@/features/favorites/favorites";
import { formatMnt } from "@/lib/format";
import { fetchRentById } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";
import type { RentType } from "@/mock/rent";

export default function RentDetailClient({ type, id }: { type: string; id: string }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);

  const rentType = type as RentType;
  const rentQuery = useQuery({
    queryKey: ["rent", "detail", rentType, id],
    queryFn: () => fetchRentById(rentType, id),
  });

  if (rentQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common.loading")}</div>;
  if (!rentQuery.data) return <div className="text-sm text-zinc-600">{t("common.notFound")}</div>;

  const rent = rentQuery.data;
  const favored = isFavorite(rent.id);
  const images = [rent.image];

  type FavoriteItem = { id: string; title: string; priceMnt: number; image: string; createdAt: string };
  const upsertFavoriteItem = (nextFavored: boolean) => {
    try {
      const raw = window.localStorage.getItem("favorites");
      const prev = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
      const item: FavoriteItem = {
        id: rent.id,
        title: rent.title,
        priceMnt: rent.pricePerDayMnt,
        image: images[0] ?? "/samples/cars/car-01.svg",
        createdAt: new Date().toISOString(),
      };
      const next = nextFavored ? [item, ...prev.filter((x) => x.id !== rent.id)] : prev.filter((x) => x.id !== rent.id);
      window.localStorage.setItem("favorites", JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const onShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다");
    } catch {
      alert("링크가 복사되었습니다");
    }
  };

  const fuelLabel = rent.fuel === "gasoline" ? "가솔린" : rent.fuel === "diesel" ? "디젤" : rent.fuel === "electric" ? "전기" : rent.fuel === "hybrid" ? "하이브리드" : "";
  const transmissionLabel = rent.transmission === "at" ? "자동" : rent.transmission === "mt" ? "수동" : "";

  const metaLine = [
    rent.yearMade ? String(rent.yearMade) : null,
    rent.mileageKm ? `${rent.mileageKm.toLocaleString("mn-MN")}km` : null,
    fuelLabel,
    transmissionLabel,
    rent.region,
  ]
    .filter(Boolean)
    .join(" · ");

  const typeLabel = rentType === "small" ? "소형" : rentType === "large" ? "대형" : "화물차";
  const backHref = `/rent/${rentType}`;

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link href={backHref} className="font-normal text-zinc-900 hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>

      {/* Top section: Gallery (left) + Sticky info (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <CarGallery
          images={images}
          title={rent.title}
          liked={favored}
          onShare={onShare}
          onToggleLike={() => {
            toggleFavorite(rent.id);
            upsertFavoriteItem(!favored);
          }}
          moreLabel={t("carDetail.more")}
          galleryTitle={t("carDetail.gallery.title")}
          selectLabel={t("carDetail.gallery.select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(rent.pricePerDayMnt)}
            </div>
            <div className="mt-1 text-sm font-medium text-zinc-600">일일 렌트</div>

            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail.sellerContact")}
              </Button>
              {sellerOpen ? (
                <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
                  <div className="font-normal">{rent.contactName}</div>
                  <a className="mt-1 inline-flex font-normal text-zinc-900 hover:underline" href={`tel:${rent.contactPhone.replace(/\s/g, "")}`}>
                    {rent.contactPhone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Title & meta */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-2xl font-normal text-zinc-900">{rent.title}</div>
        {metaLine && <div className="mt-2 text-sm text-zinc-600">{metaLine}</div>}
      </div>

      {/* Options */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("carDetail.specs.title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label="일일 렌트 가격" value={formatMnt(rent.pricePerDayMnt)} />
          <Row label="차량 유형" value={typeLabel} />
          {rent.yearMade && <Row label="제조년" value={String(rent.yearMade)} />}
          {rent.mileageKm && <Row label="총거리수" value={`${rent.mileageKm.toLocaleString("ko-KR")}km`} />}
          <Row label="지역" value={rent.region} />
          {fuelLabel && <Row label={t("carDetail.specs.fuel")} value={fuelLabel} />}
          {transmissionLabel && <Row label={t("carDetail.specs.transmission")} value={transmissionLabel} />}
          {rent.manufacturer && <Row label="제조사" value={rent.manufacturer} />}
          {rent.model && <Row label="모델" value={rent.model} />}
        </div>
      </div>

      {/* Memo / description */}
      {rent.description && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-normal text-zinc-900">{t("carDetail.desc")}</div>
          <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{rent.description}</div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-zinc-50 px-4 py-3">
      <div className="text-sm font-normal text-zinc-600">{label}</div>
      <div className={mono ? "text-sm font-normal text-zinc-900 font-mono" : "text-sm font-normal text-zinc-900"}>
        {value}
      </div>
    </div>
  );
}

