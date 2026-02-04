"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { useI18n } from "@/context/I18nContext";
import { fetchMediaList } from "@/lib/mockApi";
import type { MediaDTO } from "@/lib/apiTypes";
import { cn } from "@/lib/utils";

export default function MediaPage() {
  const { t, lang } = useI18n();
  const [tab, setTab] = React.useState<MediaDTO["type"]>("news");
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 9;

  const listQuery = useQuery({
    queryKey: ["media", "list", tab],
    queryFn: () => fetchMediaList(tab),
  });

  React.useEffect(() => {
    setPage(1);
  }, [tab]);

  const allItems = listQuery.data ?? [];
  // Calculate pagination: first page shows featured + grid, other pages show grid only
  const itemsForFirstPage = itemsPerPage; // featured (1) + grid items
  const totalPages = Math.ceil((allItems.length - 1) / itemsPerPage) + (allItems.length > 0 ? 1 : 0);
  
  const featuredItem = page === 1 && allItems.length > 0 ? allItems[0] : null;
  const gridItems = page === 1 
    ? allItems.slice(1, itemsPerPage) // First page: skip featured, show rest
    : allItems.slice((page - 2) * itemsPerPage + 1, (page - 1) * itemsPerPage + 1); // Other pages: account for featured item
  const hasMore = page < totalPages;

  const getTypeLabel = (type: MediaDTO["type"]) => {
    if (type === "news") return t("media_tab_news");
    if (type === "video") return t("media_tab_video");
    if (type === "event") return t("media_tab_event");
    return type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "mn" ? "mn-MN" : lang === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-16">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-zinc-900">{t("media_title")}</h1>
        {t("media_subtitle") && (
          <p className="text-base text-zinc-600 max-w-2xl">{t("media_subtitle")}</p>
        )}
      </div>

      <div>
        {/* Tab Bar - SortPills style */}
        <div className="flex items-center py-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {(["news", "video", "event"] as MediaDTO["type"][]).map((type, idx) => {
            const isActive = tab === type;
            return (
              <div key={type} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setTab(type)}
                  aria-pressed={isActive}
                  className={cn(
                    "text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400",
                    isActive
                      ? "text-slate-900 font-medium"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {getTypeLabel(type)}
                </button>
                {idx !== 2 && (
                  <span className="mx-2 h-4 w-px bg-slate-300/70" />
                )}
              </div>
            );
          })}
        </div>

        {/* Section Divider */}
        <div className="my-1 h-px w-full bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />

        {/* Tab Content */}
        <div className="mt-8">
          {listQuery.isLoading ? (
            <div className="text-sm text-zinc-600 py-12">{t("common_loading")}</div>
          ) : allItems.length > 0 ? (
            <div className="space-y-16">
              {/* Featured Media - Hero Section */}
              {featuredItem && (
                <Link
                  href={`/media/${featuredItem.id}`}
                  className="group block"
                >
                  <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
                    {/* Featured Image */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100">
                      <Image
                        src={featuredItem.thumbnailUrl}
                        alt={featuredItem.title}
                        fill
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 rounded-2xl"
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        priority
                      />
                    </div>

                    {/* Featured Content */}
                    <div className="flex flex-col justify-center space-y-6">
                      {/* Category Badge */}
                      <div>
                        <span className="inline-block text-xs font-medium text-zinc-500 uppercase tracking-wider">
                          {getTypeLabel(featuredItem.type)}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight group-hover:text-zinc-700 transition-colors">
                        {featuredItem.title}
                      </h2>

                      {/* Excerpt */}
                      <p className="text-base lg:text-lg text-zinc-600 leading-relaxed line-clamp-4">
                        {featuredItem.excerpt}
                      </p>

                      {/* Date */}
                      <div className="text-sm text-zinc-500">
                        {formatDate(featuredItem.createdAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Media Grid - Flat Layout */}
              {gridItems.length > 0 && (
                <div className="space-y-12">
                  <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {gridItems.map((m) => (
                      <Link
                        key={m.id}
                        href={`/media/${m.id}`}
                        className="group block"
                      >
                        <div className="space-y-4">
                          {/* Image */}
                          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100">
                            <Image
                              src={m.thumbnailUrl}
                              alt={m.title}
                              fill
                              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 rounded-xl"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          </div>

                          {/* Content */}
                          <div className="space-y-3">
                            {/* Category */}
                            <div>
                              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                {getTypeLabel(m.type)}
                              </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-zinc-700 transition-colors">
                              {m.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-sm text-zinc-600 leading-relaxed line-clamp-2">
                              {m.excerpt}
                            </p>

                            {/* Date */}
                            <div className="text-xs text-zinc-500">
                              {formatDate(m.createdAt)}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col items-center gap-4 pt-4">
                      {hasMore && (
                        <button
                          type="button"
                          onClick={() => setPage((p) => p + 1)}
                          className="rounded-xl border border-zinc-200 bg-white px-8 py-3 text-sm font-normal text-zinc-900 transition-all hover:bg-zinc-50 hover:border-zinc-300"
                        >
                          {t("common_seeMore")}
                        </button>
                      )}

                      <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-normal transition-colors ${
                              p === page
                                ? "bg-zinc-900 text-white"
                                : "bg-white text-zinc-600 hover:bg-zinc-100 border border-zinc-200"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-zinc-600">
              {t("common_noMedia")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


