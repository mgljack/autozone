"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/context/I18nContext";
import { fetchMediaList } from "@/lib/mockApi";
import type { MediaDTO } from "@/lib/apiTypes";

export default function MediaPage() {
  const { t } = useI18n();
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
  const totalPages = Math.ceil(allItems.length / itemsPerPage);
  const currentItems = allItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const hasMore = page < totalPages;

  const getTypeLabel = (type: MediaDTO["type"]) => {
    if (type === "news") return "News";
    if (type === "video") return "Video";
    if (type === "event") return "Event";
    return type;
  };

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("media_title")} subtitle={t("media_subtitle")} />

      <Tabs value={tab} onValueChange={(v) => setTab(v as MediaDTO["type"])}>
        <TabsList className="max-w-md">
          <TabsTrigger value="news">{t("media_tab_news")}</TabsTrigger>
          <TabsTrigger value="video">{t("media_tab_video")}</TabsTrigger>
          <TabsTrigger value="event">{t("media_tab_event")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="p-0 border-0 bg-transparent">
          {listQuery.isLoading ? (
            <div className="text-sm text-zinc-600">{t("common_loading")}</div>
          ) : currentItems.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {currentItems.map((m) => (
                  <Link
                    key={m.id}
                    href={`/media/${m.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white text-left shadow-sm transition-all duration-300 hover:shadow-lg hover:border-zinc-300"
                  >
                    {/* Image - Upper part of card */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
                      <Image 
                        src={m.thumbnailUrl} 
                        alt={m.title} 
                        fill 
                        className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110" 
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>

                    {/* Text content - Below image with proper spacing */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* Title */}
                      <h3 className="text-lg font-bold text-zinc-900 line-clamp-2">{m.title}</h3>

                      {/* Tag - Category badge */}
                      <div className="mt-3">
                        <span className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-normal text-zinc-700">
                          {getTypeLabel(m.type)}
                        </span>
                      </div>

                      {/* Description/Excerpt - Well-spaced from title */}
                      <div className="mt-4 flex-1">
                        <p className="line-clamp-3 text-sm leading-relaxed text-zinc-600">{m.excerpt}</p>
                      </div>

                      {/* Date */}
                      <div className="mt-4 text-xs text-zinc-500">
                        {new Date(m.createdAt).toLocaleDateString("mn-MN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* See More / Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center gap-4">
                  {/* See More button - shown when there are more items */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => setPage((p) => p + 1)}
                      className="rounded-xl border border-zinc-200 bg-white px-8 py-3 text-sm font-normal text-zinc-900 shadow-sm transition-all hover:bg-zinc-50 hover:shadow-md"
                    >
                      See More
                    </button>
                  )}

                  {/* Page numbers - shown when multiple pages exist */}
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
            </>
          ) : (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600">
              {t("common_noMedia")}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


