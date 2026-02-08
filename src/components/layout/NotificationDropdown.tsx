"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "message" | "like" | "comment" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "message",
    title: "새로운 메시지",
    message: "차량 문의에 대한 답변이 도착했습니다.",
    time: "5분 전",
    read: false,
    link: "/mypage",
  },
  {
    id: "2",
    type: "like",
    title: "관심 표시",
    message: "누군가 당신의 차량 공고에 관심을 표시했습니다.",
    time: "1시간 전",
    read: false,
    link: "/mypage",
  },
  {
    id: "3",
    type: "comment",
    title: "새로운 댓글",
    message: "차량 상세 페이지에 댓글이 달렸습니다.",
    time: "2시간 전",
    read: true,
    link: "/buy/all/1",
  },
  {
    id: "4",
    type: "system",
    title: "시스템 알림",
    message: "공고가 성공적으로 게시되었습니다.",
    time: "3시간 전",
    read: true,
    link: "/mypage",
  },
  {
    id: "5",
    type: "message",
    title: "새로운 메시지",
    message: "렌탈 문의가 도착했습니다.",
    time: "1일 전",
    read: true,
    link: "/mypage",
  },
];

function NotificationIcon({ type }: { type: Notification["type"] }) {
  switch (type) {
    case "message":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      );
    case "like":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </div>
      );
    case "comment":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
      );
    case "system":
      return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
      );
  }
}

export function NotificationDropdown({
  open,
  onClose,
  className,
}: {
  open: boolean;
  onClose: () => void;
  className?: string;
}) {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-200 sm:right-4",
        "animate-in slide-in-from-top-2 fade-in-0",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="알림"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-900">알림</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
            aria-label="닫기"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18" />
              <path d="M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto">
          {mockNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 mb-4">
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="text-sm font-medium text-zinc-900">알림이 없습니다</p>
              <p className="mt-1 text-xs text-zinc-500">새로운 알림이 도착하면 여기에 표시됩니다</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {mockNotifications.map((notification) => {
                const content = (
                  <div
                    className={cn(
                      "flex gap-3 px-5 py-4 transition-colors",
                      !notification.read && "bg-rose-50/50",
                      "hover:bg-zinc-50"
                    )}
                  >
                    <NotificationIcon type={notification.type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900">{notification.title}</p>
                          <p className="mt-1 text-sm text-zinc-600 line-clamp-2">{notification.message}</p>
                          <p className="mt-1.5 text-xs text-zinc-400">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="flex-shrink-0">
                            <div className="h-2 w-2 rounded-full bg-rose-600" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );

                if (notification.link) {
                  return (
                    <Link
                      key={notification.id}
                      href={notification.link}
                      onClick={onClose}
                      className="block"
                    >
                      {content}
                    </Link>
                  );
                }

                return <div key={notification.id}>{content}</div>;
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {mockNotifications.length > 0 && (
          <div className="border-t border-zinc-100 px-5 py-3">
            <Link
              href="/mypage?tab=notifications"
              onClick={onClose}
              className="block text-center text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              모든 알림 보기
            </Link>
          </div>
        )}
    </div>
  );
}

