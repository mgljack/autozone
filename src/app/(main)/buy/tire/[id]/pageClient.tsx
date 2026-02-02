"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { SellerInfo } from "@/components/listings/SellerInfo";
import { useFavorites } from "@/features/favorites/favorites";
import { formatMnt } from "@/lib/format";
import { fetchTireById, fetchTiresList } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";
import type { TireDetailDTO, TireListItemDTO } from "@/lib/apiTypes";

export default function TireDetailClient({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);

  const tireQuery = useQuery({
    queryKey: ["tires", "detail", id],
    queryFn: () => fetchTireById(id),
  });

  // Fetch similar tires (동급매물)
  const similarTiresQuery = useQuery({
    queryKey: ["tires", "similar", id],
    queryFn: async () => {
      if (!tireQuery.data) return { items: [] };
      const tire = tireQuery.data;
      // Filter similar tires: exclude current tire, similar price range (±30%)
      const priceMin = tire.priceMnt * 0.7;
      const priceMax = tire.priceMnt * 1.3;
      const result = await fetchTiresList({
        page: 1,
        pageSize: 20, // Get more to filter
        priceMinMnt: Math.floor(priceMin),
        priceMaxMnt: Math.ceil(priceMax),
      });
      // Exclude current tire and limit to 4
      return {
        items: result.items.filter((t) => t.id !== tire.id).slice(0, 4),
      };
    },
    enabled: !!tireQuery.data,
  });

  if (tireQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common_loading")}</div>;
  if (!tireQuery.data) return <div className="text-sm text-zinc-600">{t("common_notFound")}</div>;

  const tire = tireQuery.data;
  const favored = isFavorite(tire.id);
  const images = tire.images?.length ? tire.images : [tire.thumbnailUrl];

  type FavoriteItem = { id: string; title: string; priceMnt: number; image: string; createdAt: string };
  const upsertFavoriteItem = (nextFavored: boolean) => {
    try {
      const raw = window.localStorage.getItem("favorites");
      const prev = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
      const item: FavoriteItem = {
        id: tire.id,
        title: `${tire.brand} ${tire.size}`,
        priceMnt: tire.priceMnt,
        image: images[0] ?? "/samples/cars/car-01.svg",
        createdAt: tire.createdAt,
      };
      const next = nextFavored ? [item, ...prev.filter((x) => x.id !== tire.id)] : prev.filter((x) => x.id !== tire.id);
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
          title: `${tire.brand} ${tire.size}`,
          text: `${tire.brand} ${tire.size} - ${formatMnt(tire.priceMnt)}`,
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

  const metaLine = [
    seasonLabel,
    `DOT ${tire.dotYear}`,
    tire.installationIncluded ? t("tire_detail_installationIncluded") : t("tire_detail_installationNotIncluded"),
  ].join(" · ");

  return (
    <div className="grid gap-6">
      {/* Top section: Gallery (left) + Sticky info (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <CarGallery
          images={images}
          title={`${tire.brand} ${tire.size}`}
          liked={favored}
          onShare={onShare}
          onToggleLike={() => {
            toggleFavorite(tire.id);
            upsertFavoriteItem(!favored);
          }}
          moreLabel={t("carDetail_more")}
          galleryTitle={t("carDetail_gallery_title")}
          selectLabel={t("carDetail_gallery_select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(tire.priceMnt)}
            </div>

            {/* Seller Info */}
            {tire.seller && <SellerInfo sellerName={tire.seller.name} type="tire" />}

            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail_sellerContact")}
              </Button>
              {sellerOpen && tire.seller ? (
                <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
                  <div className="font-normal">{tire.seller.name}</div>
                  <a className="mt-1 inline-flex font-normal text-zinc-900 hover:underline" href={`tel:${tire.seller.phone.replace(/\s/g, "")}`}>
                    {tire.seller.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Title & meta */}
      <div>
        <div className="text-2xl font-normal text-zinc-900">{tire.brand} {tire.size}</div>
        <div className="mt-2 text-sm text-zinc-600">{metaLine}</div>
      </div>

      {/* Section Divider */}
      <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

      {/* Options */}
      <div>
        <div className="text-lg font-bold text-zinc-900">{t("carDetail_specs_title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label={t("tire_specs_price")} value={formatMnt(tire.priceMnt)} />
          <Row label={t("tire_specs_brand")} value={tire.brand} />
          <Row label={t("tire_specs_size")} value={tire.size} />
          <Row label={t("tire_specs_season")} value={getSeasonLabel(tire.season)} />
          <Row label={t("tire_specs_yearMade")} value={`${tire.dotYear}${t("common_year")}`} />
          <Row label={t("tire_specs_quantity")} value={`${tire.qty}${t("common_unit")}`} />
          <Row label={t("tire_specs_condition")} value={tire.condition === "new" ? t("tire_specs_condition_new") : t("tire_specs_condition_used")} />
          <Row label={t("tire_specs_installationIncluded")} value={tire.installationIncluded ? t("tire_specs_installationIncluded_yes") : t("tire_specs_installationIncluded_no")} />
          <Row label={t("tire_specs_registeredDate")} value={new Date(tire.createdAt).toLocaleDateString(lang === "ko" ? "ko-KR" : lang === "mn" ? "mn-MN" : "en-US")} />
          <Row label={t("tire_specs_region")} value={tire.regionLabel} />
        </div>
      </div>

      {/* Section Divider */}
      {tire.description && <div className="my-6 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />}

      {/* Memo / description */}
      {tire.description && (
        <div>
          <div className="text-lg font-bold text-zinc-900">{t("carDetail_desc")}</div>
          <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{tire.description}</div>
        </div>
      )}

      {/* Similar Tires (동급매물) */}
      {similarTiresQuery.data && similarTiresQuery.data.items.length > 0 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-bold text-zinc-900">{t("carDetail_similarCars")}</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarTiresQuery.data.items.map((similarTire) => (
              <SimilarTireCard key={similarTire.id} tire={similarTire} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SimilarTireCard({ tire }: { tire: TireListItemDTO }) {
  const imageUrl = tire.thumbnailUrl || "/samples/cars/car-01.svg";
  const title = `${tire.brand} ${tire.size}`;

  return (
    <Link
      href={`/buy/tire/${tire.id}`}
      className="group block overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-zinc-300"
    >
      <div className="relative h-32 w-full bg-zinc-100 sm:h-36">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-normal text-zinc-900">{title}</div>
        <div className="mt-1.5 text-base font-bold text-zinc-900">{formatMnt(tire.priceMnt)}</div>
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

