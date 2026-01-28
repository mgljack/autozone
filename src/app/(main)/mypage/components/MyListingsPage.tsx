"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CardSkeleton } from "@/components/common/CardSkeleton";
import { useI18n } from "@/context/I18nContext";
import { readMyListings, writeMyListings } from "@/features/sell/storage";
import type { ListingStatus, MyListing } from "@/features/sell/types";
import { cars as mockCars, carTitle } from "@/mock/cars";
import { formatMnt } from "@/lib/format";
import { formatRelativeTimeKo } from "@/lib/formatRelativeTime";
import { cn } from "@/lib/utils";

// Simple icon components
function Edit2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function MyListingsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [listings, setListings] = React.useState<MyListing[]>([]);
  const [activeTab, setActiveTab] = React.useState<"published" | "reviewing" | "expired" | "rejected" | "deleted">("published");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setListings(readMyListings());
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const isExpired = React.useCallback((x: MyListing) => {
    if (!x.expiresAt) return false;
    return new Date(x.expiresAt).getTime() <= Date.now();
  }, []);

  const getListingTitle = React.useCallback((x: MyListing): string => {
    if (x.draft.category === "car" || x.draft.category === "motorcycle") {
      const d = x.draft as any;
      return carTitle({ manufacturer: d.manufacturer ?? "", model: d.model ?? "", subModel: d.subModel ?? "" }) || x.id;
    }
    if (x.draft.category === "tire") {
      const d = x.draft as any;
      return `${t("mypage_tirePrefix")} ${d.radius ?? ""} ${d.width ?? ""}/${d.height ?? ""}`.trim();
    }
    return x.draft.title || x.id;
  }, [t]);

  const filteredListings = React.useMemo(() => {
    let filtered = listings;

    // Status filter
    if (activeTab === "published") {
      filtered = listings.filter((x) => x.status === "published" && !isExpired(x));
    } else if (activeTab === "reviewing") {
      filtered = listings.filter((x) => x.status === "reviewing");
    } else if (activeTab === "rejected") {
      filtered = listings.filter((x) => x.status === "rejected");
    } else if (activeTab === "deleted") {
      filtered = listings.filter((x) => x.status === "deleted");
    } else if (activeTab === "expired") {
      filtered = listings.filter((x) => x.status === "published" && isExpired(x));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((x) => {
        const title = getListingTitle(x);
        return title.toLowerCase().includes(query);
      });
    }

    // Sort (default: newest)
    filtered = [...filtered].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  }, [activeTab, listings, searchQuery, isExpired, getListingTitle]);

  const counts = React.useMemo(() => {
    const published = listings.filter((x) => x.status === "published" && !isExpired(x)).length;
    const expired = listings.filter((x) => x.status === "published" && isExpired(x)).length;
    const reviewing = listings.filter((x) => x.status === "reviewing").length;
    const rejected = listings.filter((x) => x.status === "rejected").length;
    const deleted = listings.filter((x) => x.status === "deleted").length;
    return { published, reviewing, expired, rejected, deleted };
  }, [isExpired, listings]);

  const getStatusBadge = React.useCallback((x: MyListing) => {
    const status = x.status === "published" && isExpired(x) ? "expired" : x.status;
    const statusLabels: Record<string, string> = {
      published: t("mypage_status_published"),
      reviewing: t("mypage_status_reviewing"),
      expired: t("mypage_status_expired"),
      rejected: t("mypage_status_rejected"),
      deleted: t("mypage_status_deleted"),
    };
    const statusColors: Record<string, { color: string; bgColor: string }> = {
      published: { color: "text-emerald-700", bgColor: "bg-emerald-50" },
      reviewing: { color: "text-amber-700", bgColor: "bg-amber-50" },
      expired: { color: "text-zinc-700", bgColor: "bg-zinc-50" },
      rejected: { color: "text-rose-700", bgColor: "bg-rose-50" },
      deleted: { color: "text-slate-700", bgColor: "bg-slate-50" },
    };
    const config = statusColors[status] || statusColors.published;
    const label = statusLabels[status] || statusLabels.published;
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.bgColor, config.color)}>
        {label}
      </span>
    );
  }, [isExpired, t]);

  const getMetaInfo = React.useCallback((x: MyListing): string[] => {
    const meta: string[] = [];
    if (x.draft.category === "car" || x.draft.category === "motorcycle") {
      const d = x.draft as any;
      if (d.yearMade) meta.push(`${d.yearMade}년`);
      if (d.mileageKm) meta.push(`${d.mileageKm.toLocaleString("ko-KR")}km`);
      if (d.fuel) meta.push(d.fuel);
    }
    if (x.draft.category === "tire") {
      const d = x.draft as any;
      if (d.season) meta.push(d.season);
    }
    return meta;
  }, []);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] font-bold text-zinc-900">{t("mypage_myListings_title")}</h1>
          <p className="mt-2 text-sm text-zinc-600">{t("mypage_myListings_description")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          {/* KPI Badges */}
            <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <div className="text-xs font-medium text-emerald-700">{t("mypage_myListings_kpi_published")}</div>
              <div className="mt-0.5 text-lg font-bold text-emerald-900">{counts.published}</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
              <div className="text-xs font-medium text-amber-700">{t("mypage_myListings_kpi_reviewing")}</div>
              <div className="mt-0.5 text-lg font-bold text-amber-900">{counts.reviewing}</div>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
              <div className="text-xs font-medium text-zinc-700">{t("mypage_myListings_kpi_expired")}</div>
              <div className="mt-0.5 text-lg font-bold text-zinc-900">{counts.expired}</div>
            </div>
          </div>
          {/* Primary CTA */}
          <Link href="/sell">
            <Button variant="primary" className="gap-2">
              <PlusIcon className="h-4 w-4" />
              {t("mypage_myListings_registerNew")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="published" className="gap-2">
            {t("mypage_tab_published")}
            {counts.published > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{counts.published}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviewing" className="gap-2">
            {t("mypage_tab_reviewing")}
            {counts.reviewing > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{counts.reviewing}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="expired" className="gap-2">
            {t("mypage_tab_expired")}
            {counts.expired > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{counts.expired}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            {t("mypage_tab_rejected")}
            {counts.rejected > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{counts.rejected}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="deleted" className="gap-2">
            {t("mypage_tab_deleted")}
            {counts.deleted > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">{counts.deleted}</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* List Controls Row */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-3">
            <Input
              placeholder={t("mypage_myListings_searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <div className="text-sm font-medium text-zinc-600">
            {t("mypage.myListings.results", { count: filteredListings.length })}
          </div>
        </div>

        {/* Listings Content */}
        <TabsContent value={activeTab} className="mt-0 border-0 bg-transparent p-0">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid gap-4">
              {filteredListings.map((x) => {
                const title = getListingTitle(x);
                const thumbnail = x.media?.imageNames?.[0]
                  ? `/uploads/${x.media.imageNames[0]}`
                  : "/samples/cars/car-01.svg";
                const metaInfo = getMetaInfo(x);
                const relativeTime = formatRelativeTimeKo(new Date(x.createdAt));

                return (
                  <PremiumListingCard
                    key={x.id}
                    listing={x}
                    title={title}
                    thumbnail={thumbnail}
                    metaInfo={metaInfo}
                    relativeTime={relativeTime}
                    statusBadge={getStatusBadge(x)}
                    onView={() => {
                      if (x.draft.category === "car" || x.draft.category === "motorcycle") {
                        router.push(`/buy/all/${x.id}`);
                      } else if (x.draft.category === "tire") {
                        router.push(`/buy/tire/${x.id}`);
                      } else if (x.draft.category === "parts") {
                        router.push(`/buy/parts/${x.id}`);
                      }
                    }}
                    onEdit={() => {
                      // Edit logic here
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState onRegister={() => router.push("/sell")} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PremiumListingCard({
  listing,
  title,
  thumbnail,
  metaInfo,
  relativeTime,
  statusBadge,
  onView,
  onEdit,
}: {
  listing: MyListing;
  title: string;
  thumbnail: string;
  metaInfo: string[];
  relativeTime: string;
  statusBadge: React.ReactNode;
  onView: () => void;
  onEdit: () => void;
}) {
  const { t } = useI18n();
  return (
    <Card className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex gap-5">
          {/* Thumbnail */}
          <div className="relative h-32 w-40 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-36 sm:w-48">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 160px, 192px"
            />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-semibold text-zinc-900">{title}</h3>
                {metaInfo.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                    {metaInfo.map((info, idx) => (
                      <span key={idx}>{info}</span>
                    ))}
                  </div>
                )}
                {listing.priceMnt && (
                  <div className="mt-3 text-xl font-bold text-zinc-900">{formatMnt(listing.priceMnt)}</div>
                )}
              </div>

              {/* Status Badge */}
              <div className="shrink-0">{statusBadge}</div>
            </div>

            {/* Actions & Meta */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-zinc-500">{relativeTime}</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={onView} className="gap-1.5 text-xs">
                  <EyeIcon className="h-3.5 w-3.5" />
                  {t("mypage_myListings_viewDetails")}
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 text-xs">
                  <Edit2Icon className="h-3.5 w-3.5" />
                  {t("mypage_myListings_edit")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ onRegister }: { onRegister: () => void }) {
  const { t } = useI18n();
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-zinc-400">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-zinc-900">{t("mypage_myListings_emptyTitle")}</h3>
        <p className="mt-1 text-sm text-zinc-600">{t("mypage_myListings_emptyDescription")}</p>
        <Button variant="primary" className="mt-6 gap-2" onClick={onRegister}>
          <PlusIcon className="h-4 w-4" />
          {t("mypage_myListings_registerNew")}
        </Button>
      </CardContent>
    </Card>
  );
}
