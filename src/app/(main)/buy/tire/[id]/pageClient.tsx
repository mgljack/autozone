"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { useFavorites } from "@/features/favorites/favorites";
import { formatMnt } from "@/lib/format";
import { fetchTireById } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";
import type { TireDetailDTO } from "@/lib/apiTypes";

export default function TireDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);

  const tireQuery = useQuery({
    queryKey: ["tires", "detail", id],
    queryFn: () => fetchTireById(id),
  });

  if (tireQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common.loading")}</div>;
  if (!tireQuery.data) return <div className="text-sm text-zinc-600">{t("common.notFound")}</div>;

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
      alert(t("common.linkCopied"));
    } catch (err) {
      // User cancelled share or error occurred
      if (err instanceof Error && err.name !== "AbortError") {
        // If not user cancellation, try clipboard fallback
        try {
          await navigator.clipboard.writeText(url);
          alert(t("common.linkCopied"));
        } catch {
          alert(t("common.shareFailed"));
        }
      }
    }
  };

  const seasonLabels: Record<string, string> = {
    summer: "썸머",
    winter: "윈터",
    "all-season": "올시즌",
    "off-road": "오프로드",
  };
  const seasonLabel = seasonLabels[tire.season] || tire.season;

  const metaLine = [
    seasonLabel,
    `DOT ${tire.dotYear}`,
    tire.installationIncluded ? "장착 포함" : "장착 미포함",
  ].join(" · ");

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link href="/buy/tire" className="font-normal text-zinc-900 hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>

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
          moreLabel={t("carDetail.more")}
          galleryTitle={t("carDetail.gallery.title")}
          selectLabel={t("carDetail.gallery.select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(tire.priceMnt)}
            </div>

            <div className="mt-4">
              <Button
                className="w-full bg-rose-600 hover:bg-rose-500"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail.sellerContact")}
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
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-2xl font-normal text-zinc-900">{tire.brand} {tire.size}</div>
        <div className="mt-2 text-sm text-zinc-600">{metaLine}</div>
      </div>

      {/* Options */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("carDetail.specs.title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label={t("tire.specs.price")} value={formatMnt(tire.priceMnt)} />
          <Row label={t("tire.specs.brand")} value={tire.brand} />
          <Row label={t("tire.specs.size")} value={tire.size} />
          <Row label={t("tire.specs.season")} value={seasonLabel} />
          <Row label={t("tire.specs.yearMade")} value={`${tire.dotYear}${t("common.year")}`} />
          <Row label={t("tire.specs.quantity")} value={`${tire.qty}${t("common.unit")}`} />
          <Row label={t("tire.specs.condition")} value={tire.condition === "new" ? t("tire.specs.condition.new") : t("tire.specs.condition.used")} />
          <Row label={t("tire.specs.installationIncluded")} value={tire.installationIncluded ? t("tire.specs.installationIncluded.yes") : t("tire.specs.installationIncluded.no")} />
          <Row label={t("tire.specs.registeredDate")} value={new Date(tire.createdAt).toLocaleDateString("ko-KR")} />
          <Row label={t("tire.specs.region")} value={tire.regionLabel} />
        </div>
      </div>

      {/* Memo / description */}
      {tire.description && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-normal text-zinc-900">{t("carDetail.desc")}</div>
          <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{tire.description}</div>
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

