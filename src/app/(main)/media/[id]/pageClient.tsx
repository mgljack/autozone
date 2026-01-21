"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import React from "react";

import { fetchMediaById, fetchMediaList } from "@/lib/mockApi";
import type { MediaDTO } from "@/lib/apiTypes";

export default function MediaDetailClient({ id }: { id: string }) {
  const [liked, setLiked] = React.useState(false);
  const [likeCount, setLikeCount] = React.useState(0);

  const detailQuery = useQuery({
    queryKey: ["media", "detail", id],
    queryFn: () => fetchMediaById(id),
  });

  const listQuery = useQuery({
    queryKey: ["media", "list", "all"],
    queryFn: () => fetchMediaList("all"),
  });

  React.useEffect(() => {
    if (detailQuery.data) {
      setLikeCount(detailQuery.data.likeCount ?? 0);
    }
  }, [detailQuery.data]);

  if (detailQuery.isLoading) {
    return (
      <div className="grid gap-6">
        <div className="text-sm text-zinc-600">로딩 중...</div>
      </div>
    );
  }

  if (!detailQuery.data) {
    return (
      <div className="grid gap-6">
        <div className="text-sm text-zinc-600">기사를 찾을 수 없습니다.</div>
      </div>
    );
  }

  const news = detailQuery.data;
  const allNews = listQuery.data ?? [];
  
  // Find previous article (sorted by publishedAt descending)
  const sortedNews = [...allNews].sort((a, b) => {
    const dateA = new Date(a.publishedAt ?? a.createdAt).getTime();
    const dateB = new Date(b.publishedAt ?? b.createdAt).getTime();
    return dateB - dateA;
  });
  
  const currentIndex = sortedNews.findIndex((n) => n.id === news.id);
  const previousNews = currentIndex >= 0 && currentIndex < sortedNews.length - 1 ? sortedNews[currentIndex + 1] : null;

  const handleLike = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = news.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert("링크가 복사되었습니다.");
      } catch (err) {
        alert("링크 복사에 실패했습니다.");
      }
    }
  };

  const formatPublishedAt = (dateStr?: string) => {
    if (!dateStr) return "";
    // If already in "YYYY-MM-DD HH:mm" format, return as is
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(dateStr)) {
      return dateStr;
    }
    // Otherwise parse ISO string
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const coverImage = news.coverImage || news.thumbnailUrl;
  const images = news.images && news.images.length > 0 ? news.images : [coverImage];
  const content = news.content || news.excerpt;
  const author = news.author || news.reporterName || "관리자";

  return (
    <div className="grid gap-6">
      {/* Main Content + Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Main Article */}
        <article className="grid gap-6">
          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">{news.title}</h1>
            <div className="mt-3 h-px bg-zinc-200" />
          </div>

          {/* Meta */}
          <div className="text-sm text-zinc-600">
            {author} · {formatPublishedAt(news.publishedAt || news.createdAt)}
          </div>

          {/* Main Image - Single representative image only */}
          {images.length > 0 && (
            <div className="mb-6 w-full overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              <div className="relative w-full" style={{ aspectRatio: "16/9", maxHeight: "480px" }}>
                <Image
                  src={coverImage}
                  alt={news.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                />
              </div>
            </div>
          )}

          {/* Body */}
          <div className="prose prose-zinc max-w-none">
            <div className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
              {content.split("\n\n").map((paragraph, idx) => (
                <p key={idx} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-4 border-t border-zinc-200 pt-6">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                liked
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              +{likeCount}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              공유하기
            </button>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="grid gap-4">
          {/* Back to list */}
          <Link
            href="/media"
            className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            목록으로 돌아가기
          </Link>

          {/* Previous article */}
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="mb-3 text-xs font-normal text-zinc-600">이전글</div>
            {previousNews ? (
              <Link href={`/media/${previousNews.id}`} className="block">
                <div className="mb-2">
                  <span className="inline-block rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-xs font-normal text-zinc-700">
                    {previousNews.type === "news" ? "뉴스" : previousNews.type === "video" ? "비디오" : "이벤트"}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-sm font-normal text-zinc-900">{previousNews.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs text-zinc-600">{previousNews.excerpt}</p>
                {previousNews.publishedAt && (
                  <div className="mt-2 text-xs text-zinc-500">
                    {formatPublishedAt(previousNews.publishedAt)}
                  </div>
                )}
              </Link>
            ) : (
              <div className="text-sm text-zinc-500">이전글이 없습니다.</div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

