"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { Button } from "@/components/ui/button";
import { CarGallery } from "@/components/cars/CarGallery";
import { useFavorites } from "@/features/favorites/favorites";
import { formatMnt } from "@/lib/format";
import { fetchPartById } from "@/lib/mockApi";
import { useI18n } from "@/context/I18nContext";
import type { PartDetailDTO } from "@/lib/apiTypes";

export default function PartDetailClient({ id }: { id: string }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [sellerOpen, setSellerOpen] = React.useState(false);

  const partQuery = useQuery({
    queryKey: ["parts", "detail", id],
    queryFn: () => fetchPartById(id),
  });

  if (partQuery.isLoading) return <div className="text-sm text-zinc-600">{t("common.loading")}</div>;
  if (!partQuery.data) return <div className="text-sm text-zinc-600">{t("common.notFound")}</div>;

  const part = partQuery.data;
  const favored = isFavorite(part.id);
  const images = part.images?.length ? part.images : [part.thumbnailUrl];

  type FavoriteItem = { id: string; title: string; priceMnt: number; image: string; createdAt: string };
  const upsertFavoriteItem = (nextFavored: boolean) => {
    try {
      const raw = window.localStorage.getItem("favorites");
      const prev = raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
      const item: FavoriteItem = {
        id: part.id,
        title: part.name,
        priceMnt: part.priceMnt,
        image: images[0] ?? "/samples/cars/car-01.svg",
        createdAt: part.createdAt,
      };
      const next = nextFavored ? [item, ...prev.filter((x) => x.id !== part.id)] : prev.filter((x) => x.id !== part.id);
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
          title: part.name,
          text: `${part.name} - ${formatMnt(part.priceMnt)}`,
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

  const metaLine = [
    part.forManufacturer && part.forModel ? `${part.forManufacturer} ${part.forModel}` : null,
    part.condition === "new" ? "신품" : "중고",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="grid gap-6">
      <div className="text-sm">
        <Link href="/buy/parts" className="font-normal text-zinc-900 hover:underline">
          ← 목록으로 돌아가기
        </Link>
      </div>

      {/* Top section: Gallery (left) + Sticky info (right) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <CarGallery
          images={images}
          title={part.name}
          liked={favored}
          onShare={onShare}
          onToggleLike={() => {
            toggleFavorite(part.id);
            upsertFavoriteItem(!favored);
          }}
          moreLabel={t("carDetail.more")}
          galleryTitle={t("carDetail.gallery.title")}
          selectLabel={t("carDetail.gallery.select")}
        />

        <aside className="lg:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <div className="text-3xl font-extrabold tracking-tight text-zinc-900">
              {formatMnt(part.priceMnt)}
            </div>

            <div className="mt-4">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setSellerOpen((v) => !v)}
              >
                {t("carDetail.sellerContact")}
              </Button>
              {sellerOpen && part.seller ? (
                <div className="mt-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm">
                  <div className="font-normal">{part.seller.name}</div>
                  <a className="mt-1 inline-flex font-normal text-zinc-900 hover:underline" href={`tel:${part.seller.phone.replace(/\s/g, "")}`}>
                    {part.seller.phone}
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      {/* Title & meta */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-2xl font-normal text-zinc-900">{part.name}</div>
        {metaLine && <div className="mt-2 text-sm text-zinc-600">{metaLine}</div>}
      </div>

      {/* Options */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="text-sm font-normal text-zinc-900">{t("carDetail.specs.title")}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Row label={t("parts.specs.price")} value={formatMnt(part.priceMnt)} />
          <Row label={t("parts.specs.condition")} value={part.condition === "new" ? t("parts.specs.condition.new") : t("parts.specs.condition.used")} />
          <Row label={t("parts.specs.registeredDate")} value={new Date(part.createdAt).toLocaleDateString("ko-KR")} />
          <Row label={t("parts.specs.region")} value={part.regionLabel} />
          {part.forManufacturer && <Row label={t("parts.specs.manufacturer")} value={part.forManufacturer} />}
          {part.forModel && <Row label={t("parts.specs.compatibleModel")} value={part.forModel} />}
        </div>
      </div>

      {/* Memo / description */}
      {part.description && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm font-normal text-zinc-900">{t("carDetail.desc")}</div>
          <div className="mt-3 whitespace-pre-line text-sm text-zinc-600">{part.description}</div>
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

