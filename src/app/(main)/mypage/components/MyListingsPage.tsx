"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";
import { readMyListings, writeMyListings } from "@/features/sell/storage";
import type { ListingStatus, MyListing } from "@/features/sell/types";
import { cars as mockCars } from "@/mock/cars";
import { formatMnt } from "@/lib/format";
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
function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

export function MyListingsPage() {
  const { t } = useI18n();
  const [listings, setListings] = React.useState<MyListing[]>([]);
  const [activeTab, setActiveTab] = React.useState<
    "all" | "published" | "reviewing" | "expired" | "rejected" | "deleted"
  >("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    setListings(readMyListings());
  }, []);

  const isExpired = React.useCallback((x: MyListing) => {
    if (!x.expiresAt) return false;
    return new Date(x.expiresAt).getTime() <= Date.now();
  }, []);

  const getListingTitle = React.useCallback((x: MyListing): string => {
    if (x.draft.category === "car" || x.draft.category === "motorcycle") {
      const d = x.draft as any;
      return `${d.manufacturer ?? ""} ${d.model ?? ""}`.trim() || x.id;
    }
    if (x.draft.category === "tire") {
      const d = x.draft as any;
      return `${t("mypage.tirePrefix")} ${d.radius ?? ""} ${d.width ?? ""}/${d.height ?? ""}`.trim();
    }
    return x.draft.title || x.id;
  }, [t]);

  const filteredListings = React.useMemo(() => {
    let filtered = listings;

    // Status filter
    if (activeTab === "all") {
      filtered = listings;
    } else if (activeTab === "published") {
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

    return filtered;
  }, [activeTab, listings, searchQuery, isExpired, getListingTitle]);

  const counts = React.useMemo(() => {
    const all = listings.length;
    const published = listings.filter((x) => x.status === "published" && !isExpired(x)).length;
    const expired = listings.filter((x) => x.status === "published" && isExpired(x)).length;
    const reviewing = listings.filter((x) => x.status === "reviewing").length;
    const rejected = listings.filter((x) => x.status === "rejected").length;
    const deleted = listings.filter((x) => x.status === "deleted").length;
    return { all, published, reviewing, expired, rejected, deleted };
  }, [isExpired, listings]);

  const updateListingStatus = (id: string, nextStatus: ListingStatus) => {
    setListings((prev) => {
      const next: MyListing[] = prev.map((x) => {
        if (x.id !== id) return x;
        if (nextStatus !== "published") return { ...x, status: nextStatus } as MyListing;

        const now = new Date();
        const durationDays = x.durationDays ?? 15;
        const expiresAt = x.expiresAt ?? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        const updated: MyListing = {
          ...x,
          status: "published",
          tier: x.tier ?? "general",
          durationDays,
          priceMnt: x.priceMnt ?? 0,
          publishedAt: x.publishedAt ?? now.toISOString(),
          expiresAt,
        };
        return updated;
      });
      writeMyListings(next);
      return next;
    });
  };


  const getStatusBadge = React.useCallback((x: MyListing) => {
    const status = x.status === "published" && isExpired(x) ? "expired" : x.status;
    const statusLabels: Record<string, string> = {
      published: t("mypage.status.published"),
      reviewing: t("mypage.status.reviewing"),
      expired: t("mypage.status.expired"),
      rejected: t("mypage.status.rejected"),
      deleted: t("mypage.status.deleted"),
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

  const getDaysUntilExpiry = (expiresAt?: string): string | null => {
    if (!expiresAt) return null;
    const now = Date.now();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    if (diff < 0) return null;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return `D-${days}`;
  };

  const tabs = [
    { key: "all" as const, label: t("mypage.tab.all"), count: counts.all },
    { key: "published" as const, label: t("mypage.tab.published"), count: counts.published },
    { key: "reviewing" as const, label: t("mypage.tab.reviewing"), count: counts.reviewing },
    { key: "expired" as const, label: t("mypage.tab.expired"), count: counts.expired },
    { key: "rejected" as const, label: t("mypage.tab.rejected"), count: counts.rejected },
    { key: "deleted" as const, label: t("mypage.tab.deleted"), count: counts.deleted },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">{t("mypage.myListings.title")}</h1>
        <p className="mt-1 text-sm text-zinc-600">{t("mypage.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto">
        <div className="flex gap-2 border-b border-zinc-200">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-rose-600 text-rose-600"
                  : "border-transparent text-zinc-600 hover:text-zinc-900",
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    activeTab === tab.key ? "bg-rose-600 text-white" : "bg-zinc-200 text-zinc-700",
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <Input
          placeholder="제목 또는 모델명 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Listings */}
      {false && filteredListings.length > 0 ? (
        <div className="space-y-4">
          {filteredListings.map((x) => {
            const title = getListingTitle(x);
            const thumbnail = x.media?.imageNames?.[0]
              ? `/uploads/${x.media.imageNames[0]}`
              : "/samples/cars/car-01.svg";
            const daysUntilExpiry = getDaysUntilExpiry(x.expiresAt);

            return (
              <Card key={x.id} className="group transition-all hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                      <Image src={thumbnail} alt={title} fill className="object-cover" />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-zinc-600">
                            {x.draft.category === "car" && (x.draft as any).yearMade && (
                              <span>{(x.draft as any).yearMade}년</span>
                            )}
                            {x.draft.category === "car" && (x.draft as any).mileageKm && (
                              <span>{(x.draft as any).mileageKm}km</span>
                            )}
                            {x.priceMnt && <span className="font-semibold text-zinc-900">{formatMnt(x.priceMnt)}</span>}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex shrink-0 items-center gap-3">
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(x)}
                            {daysUntilExpiry && (
                              <span className="text-xs text-zinc-500">{daysUntilExpiry}</span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {x.draft.category === "car" && (
                              <Link href={`/buy/all/${x.id}`}>
                                <Button variant="outline" size="sm">
                                  <EyeIcon className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Edit logic here
                              }}
                            >
                              <Edit2Icon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (confirm("정말 삭제하시겠습니까?")) {
                                  updateListingStatus(x.id, "deleted");
                                }
                              }}
                            >
                              <Trash2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

