"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { EncarDiagnosticMock } from "@/components/cars/EncarDiagnosticMock";
import { VehiclePriceComparison } from "@/components/cars/VehiclePriceComparison";
import { OptionInfoSection } from "@/components/cars/OptionInfoSection";
import { SellerInfo } from "@/components/listings/SellerInfo";
import { FinanceCalculatorModal } from "@/components/detail/FinanceCalculatorModal";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { formatMnt } from "@/lib/format";
import { fetchCarById, fetchCarsList, fetchMotorcyclesList } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";
import type { CarListItemDTO } from "@/lib/apiTypes";

export default function CarDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const { addRecent } = useRecentCars();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);
  const [financeModalOpen, setFinanceModalOpen] = React.useState(false);
  const [financeModalTab, setFinanceModalTab] = React.useState<"insurance" | "loan">("insurance");

  const carQuery = useQuery({
    queryKey: ["cars", "detail", id],
    queryFn: () => fetchCarById(id),
  });

  // Fetch similar cars/motorcycles (동급매물)
  const similarCarsQuery = useQuery({
    queryKey: ["cars", "similar", id],
    queryFn: async () => {
      if (!carQuery.data) return { items: [] };
      const car = carQuery.data;
      const isMotorcycle = car.id.startsWith("moto_");
      // Filter similar vehicles: exclude current vehicle, similar price range (±30%)
      const priceMin = car.priceMnt * 0.7;
      const priceMax = car.priceMnt * 1.3;
      
      const result = isMotorcycle
        ? await fetchMotorcyclesList({
            page: 1,
            pageSize: 20, // Get more to filter
            priceMinMnt: Math.floor(priceMin),
            priceMaxMnt: Math.ceil(priceMax),
          })
        : await fetchCarsList({
            page: 1,
            pageSize: 20, // Get more to filter
            priceMinMnt: Math.floor(priceMin),
            priceMaxMnt: Math.ceil(priceMax),
          });
      // Exclude current vehicle and limit to 4
      return {
        items: result.items.filter((c) => c.id !== car.id).slice(0, 4),
      };
    },
    enabled: !!carQuery.data,
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

  if (carQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common_loading")}</div>;
  if (!carQuery.data) return <div className="text-sm text-zinc-600">{t("common_notFound")}</div>;

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
      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          title: car.title,
          text: `${car.title} - ${formatMnt(car.priceMnt)}`,
          url: url,
        });
        return;
      }
      // Fallback to clipboard
      await navigator.clipboard.writeText(url);
      alert(t("common_linkCopied"));
    } catch (err) {
      // User cancelled share or error occurred
      if (err instanceof Error && err.name !== "AbortError") {
        // If not user cancellation, try clipboard fallback
        try {
      await navigator.clipboard.writeText(url);
          alert(t("common_linkCopied"));
    } catch {
          alert(t("common_shareFailed"));
        }
      }
    }
  };

  return (
    <div className="grid gap-6">
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
          moreLabel={t("carDetail_more")}
          galleryTitle={t("carDetail_gallery_title")}
          selectLabel={t("carDetail_gallery_select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:p-5">
            {/* Price */}
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(car.priceMnt)}
            </div>

            {/* Key Specs: Year, Mileage, Fuel */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">
                  {car.yearImported
                    ? t("carDetail_specs_yearMadeAndImported")
                    : t("carDetail_specs_yearMade")}
                </span>
                <span className="font-semibold text-slate-900">
                  {car.yearMade}
                  {car.yearImported ? ` / ${car.yearImported}` : ""}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{t("carDetail_specs_mileage")}</span>
                <span className="font-semibold text-slate-900">
                  {car.mileageKm ? `${car.mileageKm.toLocaleString("ko-KR")}km` : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-slate-500">{t("carDetail_specs_fuel")}</span>
                <span className="font-semibold text-slate-900">
                  {car.specs?.fuel || "-"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setFinanceModalTab("insurance");
                    setFinanceModalOpen(true);
                  }}
                >
                  보험료 계산
                </Button>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setFinanceModalTab("loan");
                    setFinanceModalOpen(true);
                  }}
                >
                  대출 계산
                </Button>
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail_sellerContact")}
              </Button>
              {sellerOpen ? (
                <div className="mt-3 rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-slate-900">{car.seller.name}</div>
                    <span className="flex cursor-pointer items-center gap-1 text-sm text-[#b70f28] hover:text-[#8a0b1f] hover:underline">
                      다른 매물
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[#b70f28]"
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                  <a className="mt-1.5 inline-flex font-medium text-slate-900 hover:text-slate-700 hover:underline" href={`tel:${car.seller.phone.replace(/\s/g, "")}`}>
                    {car.seller.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Title & meta */}
      <div>
        <div className="text-2xl font-normal text-zinc-900">{car.title}</div>
      </div>

      {/* Section Divider */}
      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

      {/* Options Section */}
      {!isMotorcycle ? <OptionInfoSection options={car.options} /> : null}

      {/* Section Divider */}
      {!isMotorcycle && <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />}

      {/* Vehicle Status Section */}
      {!isMotorcycle ? <EncarDiagnosticMock carId={car.id} title={t("vehicleStatus_title")} /> : null}

      {/* Section Divider */}
      {!isMotorcycle && <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />}

      {/* Options */}
      <div>
        <div className="text-lg font-bold text-zinc-900">{t("carDetail_specs_title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label={t("carDetail_specs_price")} value={formatMnt(car.priceMnt)} />
          <Row label={t("carDetail_specs_tier")} value={car.tier.toUpperCase()} />
          <Row label={t("carDetail_specs_registeredDate")} value={new Date(car.createdAt).toLocaleDateString("ko-KR")} />
          <Row label={t("carDetail_specs_yearMade")} value={String(car.yearMade)} />
          <Row label={t("carDetail_specs_yearImported")} value={String(car.yearImported)} />
          <Row label={t("carDetail_specs_mileage")} value={`${car.mileageKm.toLocaleString("ko-KR")}km`} />
          <Row label={t("carDetail_specs_region")} value={car.regionLabel} />
          <Row label={t("carDetail_specs_fuel")} value={car.specs.fuel} />
          <Row label={t("carDetail_specs_transmission")} value={car.specs.transmission} />
          <Row label={t("carDetail_specs_color")} value={car.specs.color} />
          <Row label={t("carDetail_specs_steering")} value={car.specs.steering} />
          <Row label={t("carDetail_specs_accident")} value={car.specs.accident ? t("common_yes") : t("common_no")} />
          <Row label={t("carDetail_specs_plate")} value={car.specs.hasPlate ? t("common_yes") : t("common_no")} />
          <Row label={t("carDetail_specs_vin")} value={car.specs.vin} mono />
        </div>
      </div>

      {/* Section Divider */}
      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

      {/* Memo / description */}
      <div>
        <div className="text-lg font-bold text-zinc-900">{t("carDetail_desc")}</div>
        <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{car.description}</div>
      </div>

      {/* Section Divider */}
      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

      {/* Price Comparison */}
      <VehiclePriceComparison
        sellingPrice={car.priceMnt}
        newCarPrice={undefined}
        recentImportPrice={undefined}
      />

      {/* Similar Cars (동급매물) */}
      {similarCarsQuery.data && similarCarsQuery.data.items.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-bold text-zinc-900">{t("carDetail_similarCars")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarCarsQuery.data.items.map((similarCar) => (
              <SimilarCarCard key={similarCar.id} car={similarCar} />
            ))}
          </div>
        </div>
      )}

      {/* Finance Calculator Modal */}
      <FinanceCalculatorModal
        open={financeModalOpen}
        onOpenChange={setFinanceModalOpen}
        initialTab={financeModalTab}
        price={car.priceMnt}
      />
    </div>
  );
}

function SimilarCarCard({ car }: { car: CarListItemDTO }) {
  const imageUrl = car.thumbnailUrl || car.images?.[0] || "/samples/cars/car-01.svg";

  return (
    <Link
      href={`/buy/all/${car.id}`}
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-36">
        <Image
          src={imageUrl}
          alt={car.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-normal text-zinc-900">{car.title}</div>
        <div className="mt-1.5 text-base font-bold text-zinc-900">{formatMnt(car.priceMnt)}</div>
      </div>
    </Link>
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


