"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { EncarDiagnosticMock } from "@/components/cars/EncarDiagnosticMock";
import { VehiclePriceComparison } from "@/components/cars/VehiclePriceComparison";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { formatMnt } from "@/lib/format";
import { fetchCarById } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";

export default function CarDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const { addRecent } = useRecentCars();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);

  const carQuery = useQuery({
    queryKey: ["cars", "detail", id],
    queryFn: () => fetchCarById(id),
  });

  React.useEffect(() => {
    const cid = carQuery.data?.id;
    if (!cid) return;
    addRecent(cid);

    // Also store in required key: localStorage['recentViewed'] (max 10, de-dup)
    try {
      const raw = window.localStorage.getItem("recentViewed");
      const prev = raw ? (JSON.parse(raw) as Array<{ id: string; viewedAt: string }>) : [];
      const now = new Date().toISOString();
      const next = [{ id: cid, viewedAt: now }, ...prev.filter((x) => x.id !== cid)].slice(0, 10);
      window.localStorage.setItem("recentViewed", JSON.stringify(next));
    } catch {
      // ignore
    }
  }, [carQuery.data?.id, addRecent]);

  if (carQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common.loading")}</div>;
  if (!carQuery.data) return <div className="text-sm text-zinc-600">{t("common.notFound")}</div>;

  const car = carQuery.data;
  const favored = isFavorite(car.id);
  const images = car.images?.length ? car.images : ["/samples/cars/car-01.svg"];
  const isMotorcycle = car.id.startsWith("moto_");

  type FavoriteItem = { id: string; title: string; priceMnt: number; image: string; createdAt: string };
  const upsertFavoriteItem = (nextFavored: boolean) => {
    // Requirement: localStorage key 'favorites' stores minimal objects
    try {
      const raw = window.localStorage.getItem("favorites");
      const prev = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
      const item: FavoriteItem = {
        id: car.id,
        title: car.title,
        priceMnt: car.priceMnt,
        image: images[0] ?? "/samples/cars/car-01.svg",
        createdAt: car.createdAt,
      };
      const next = nextFavored ? [item, ...prev.filter((x) => x.id !== car.id)] : prev.filter((x) => x.id !== car.id);
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

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link href="/buy/all" className="font-normal text-zinc-900 hover:underline">
          ← {t("carDetail.backToList")}
        </Link>
      </div>

      {/* Top section: Gallery (left) + Sticky info (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <CarGallery
          images={images}
          title={car.title}
          liked={favored}
          onShare={onShare}
          onToggleLike={() => {
            toggleFavorite(car.id);
            upsertFavoriteItem(!favored);
          }}
          moreLabel={t("carDetail.more")}
          galleryTitle={t("carDetail.gallery.title")}
          selectLabel={t("carDetail.gallery.select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(car.priceMnt)}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-xs font-normal text-zinc-700">
              <button type="button" className="rounded-full border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50">
                보험료 계산
              </button>
              <button type="button" className="rounded-full border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50">
                대출금리 조회
              </button>
              <button type="button" className="rounded-full border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50">
                리스상품 조회
              </button>
            </div>

            <div className="mt-4 grid gap-2 text-sm text-zinc-700">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <span className="text-zinc-600">보험이력</span>
                <span className="font-normal">프로토타입</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2">
                <span className="text-zinc-600">성능점검내역</span>
                <span className="font-normal">프로토타입</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                className="w-full bg-rose-600 hover:bg-rose-500"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail.sellerContact")}
              </Button>
              {sellerOpen ? (
                <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
                  <div className="font-normal">{car.seller.name}</div>
                  <a className="mt-1 inline-flex font-normal text-zinc-900 hover:underline" href={`tel:${car.seller.phone.replace(/\s/g, "")}`}>
                    {car.seller.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Title & meta */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-2xl font-normal text-zinc-900">{car.title}</div>
        <div className="mt-2 text-sm text-zinc-600">
          {car.yearMade} · {car.yearImported} · {car.mileageKm.toLocaleString("mn-MN")}km · {car.specs.fuel}
        </div>
      </div>

      {!isMotorcycle ? <EncarDiagnosticMock carId={car.id} title={t("vehicleStatus.title")} /> : null}

      {/* Options */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("carDetail.specs.title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label={t("carDetail.specs.price")} value={formatMnt(car.priceMnt)} />
          <Row label={t("carDetail.specs.tier")} value={car.tier.toUpperCase()} />
          <Row label={t("carDetail.specs.registeredDate")} value={new Date(car.createdAt).toLocaleDateString("ko-KR")} />
          <Row label={t("carDetail.specs.yearMade")} value={String(car.yearMade)} />
          <Row label={t("carDetail.specs.yearImported")} value={String(car.yearImported)} />
          <Row label={t("carDetail.specs.mileage")} value={`${car.mileageKm.toLocaleString("ko-KR")}km`} />
          <Row label={t("carDetail.specs.region")} value={car.regionLabel} />
          <Row label={t("carDetail.specs.fuel")} value={car.specs.fuel} />
          <Row label={t("carDetail.specs.transmission")} value={car.specs.transmission} />
          <Row label={t("carDetail.specs.color")} value={car.specs.color} />
          <Row label={t("carDetail.specs.steering")} value={car.specs.steering} />
          <Row label={t("carDetail.specs.accident")} value={car.specs.accident ? t("common.yes") : t("common.no")} />
          <Row label={t("carDetail.specs.plate")} value={car.specs.hasPlate ? t("common.yes") : t("common.no")} />
          <Row label={t("carDetail.specs.vin")} value={car.specs.vin} mono />
        </div>
      </div>

      {/* Memo / description */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("carDetail.desc")}</div>
        <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{car.description}</div>
      </div>

      {/* Price Comparison */}
      <VehiclePriceComparison
        sellingPrice={car.priceMnt}
        newCarPrice={undefined}
        recentImportPrice={undefined}
      />
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


