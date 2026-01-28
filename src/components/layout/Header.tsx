"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

import { LanguageSelect } from "@/components/common/LanguageSelect";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { cn } from "@/lib/utils";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      suppressHydrationWarning
      className={cn(
        "group relative inline-flex items-center rounded-lg px-2 py-1 text-sm font-normal text-zinc-700 hover:text-zinc-900",
        active && "bg-zinc-100 text-zinc-900",
      )}
    >
      {children}
      <svg
        className="ml-1 h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </Link>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function Header() {
  const { t } = useI18n();
  const { session, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [rentOpen, setRentOpen] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const rentOpenTimer = React.useRef<number | null>(null);
  const rentCloseTimer = React.useRef<number | null>(null);

  const clearRentTimers = React.useCallback(() => {
    if (rentOpenTimer.current) window.clearTimeout(rentOpenTimer.current);
    if (rentCloseTimer.current) window.clearTimeout(rentCloseTimer.current);
    rentOpenTimer.current = null;
    rentCloseTimer.current = null;
  }, []);

  const openRent = React.useCallback(() => {
    clearRentTimers();
    rentOpenTimer.current = window.setTimeout(() => setRentOpen(true), 120);
  }, [clearRentTimers]);

  const closeRent = React.useCallback(() => {
    clearRentTimers();
    rentCloseTimer.current = window.setTimeout(() => setRentOpen(false), 160);
  }, [clearRentTimers]);

  React.useEffect(() => clearRentTimers, [clearRentTimers]);
  React.useEffect(() => setMounted(true), []);

  const tt = React.useCallback(
    (key: string) => (mounted ? t(key as any) : ""),
    [mounted, t],
  );

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-3 py-3 sm:px-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 sm:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={tt("common_openMenu")}
            suppressHydrationWarning
          >
            ☰
          </button>
          <Link href="/" className="text-lg font-extrabold tracking-tight text-zinc-900">
            {t("app_name")}
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            <div className="group relative">
              <Link
                href="/buy"
                suppressHydrationWarning
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/buy/all");
                }}
                className={cn(
                  "group/link relative inline-flex items-center rounded-lg px-2 py-1 text-sm font-normal text-zinc-700 hover:text-zinc-900",
                  (pathname === "/buy" || (pathname && pathname.startsWith("/buy"))) && "bg-zinc-100 text-zinc-900",
                )}
              >
                {tt("nav_buy")}
                <svg
                  className="ml-1 h-3 w-3 opacity-0 transition-opacity duration-200 group-hover/link:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Link>
              <div className="invisible absolute left-0 top-full mt-2 w-64 rounded-2xl border border-zinc-200 bg-white p-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy/all" suppressHydrationWarning>
                  {tt("nav_allVehicles")}
                </Link>
                <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy/motorcycle" suppressHydrationWarning>
                  {tt("nav_motorcycle")}
                </Link>
                <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy/tire" suppressHydrationWarning>
                  {tt("nav_tire")}
                </Link>
                <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/buy/parts" suppressHydrationWarning>
                  {tt("nav_parts")}
                </Link>
              </div>
            </div>
            <div
              className="group relative"
              onMouseEnter={openRent}
              onMouseLeave={closeRent}
              onFocusCapture={openRent}
              onBlurCapture={(e) => {
                const next = e.relatedTarget as Node | null;
                if (next && e.currentTarget.contains(next)) return;
                closeRent();
              }}
            >
              <button
                type="button"
                onClick={() => router.push("/rent/small")}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    setRentOpen(false);
                  }
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push("/rent/small");
                  }
                }}
                className={cn(
                  "group/btn relative rounded-lg px-2 py-1 text-sm font-normal text-zinc-700 hover:text-zinc-900",
                  pathname?.startsWith("/rent") && "bg-zinc-100 text-zinc-900",
                )}
                aria-expanded={rentOpen}
                suppressHydrationWarning
              >
                {tt("nav_rent")}
                <svg
                  className="ml-1 inline-block h-3 w-3 opacity-0 transition-opacity duration-200 group-hover/btn:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {rentOpen ? (
                <div
                  className="absolute left-0 top-full mt-2 w-56 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setRentOpen(false);
                    }
                  }}
                >
                  <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/rent/small" onClick={() => setRentOpen(false)} suppressHydrationWarning>
                    {tt("rent_small")}
                  </Link>
                  <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/rent/large" onClick={() => setRentOpen(false)} suppressHydrationWarning>
                    {tt("rent_large")}
                  </Link>
                  <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-zinc-50" href="/rent/truck" onClick={() => setRentOpen(false)} suppressHydrationWarning>
                    {tt("rent_truck")}
                  </Link>
                </div>
              ) : null}
            </div>
            <NavLink href="/service">{tt("nav_service")}</NavLink>
            <NavLink href="/media">{tt("nav_media")}</NavLink>
            <Link
              href="/sell"
              suppressHydrationWarning
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-600/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-600",
                pathname?.startsWith("/sell") && "bg-rose-600/10",
              )}
            >
              <PlusIcon className="h-4 w-4" />
              {tt("header_addListing")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {mounted ? <LanguageSelect /> : null}
          {mounted && session ? (
            <>
              <Link href="/mypage" className="hidden sm:inline-flex">
                <Button variant="outline">{tt("nav_mypage")}</Button>
              </Link>
              <Button variant="outline" className="hidden sm:inline-flex" onClick={logout}>
                {tt("auth_logout")}
              </Button>
            </>
          ) : mounted ? (
            <>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button>{tt("auth_login")}</Button>
              </Link>
              <Link href="/signup" className="hidden sm:inline-flex">
                <Button variant="outline">{tt("auth_signup")}</Button>
              </Link>
            </>
          ) : null}
          {/* Notification Icon - Always rightmost */}
          <button
            type="button"
            onClick={() => {
              // Placeholder handler
              console.log("Notifications clicked");
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-rose-600 transition-all duration-200 hover:scale-105 hover:bg-rose-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600/50 focus-visible:ring-offset-2"
            aria-label={tt("common_notifications")}
            title={tt("common_notifications")}
            suppressHydrationWarning
          >
            <BellIcon className="h-[20px] w-[20px] sm:h-[22px] sm:w-[22px]" />
          </button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent className="p-0">
          <SheetHeader>
            <SheetTitle>{t("app_name")}</SheetTitle>
            <button
              type="button"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal hover:bg-zinc-50"
              onClick={() => setMobileOpen(false)}
            >
              {tt("common_close")}
            </button>
          </SheetHeader>
          <div className="grid gap-4 p-4">
            <div className="grid gap-2">
              <div className="text-xs font-normal text-zinc-600">{tt("nav_buy")}</div>
              <div className="grid gap-1">
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/buy/all" onClick={() => setMobileOpen(false)}>
                  {tt("nav_allVehicles")}
                </Link>
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/buy/motorcycle" onClick={() => setMobileOpen(false)}>
                  {tt("nav_motorcycle")}
                </Link>
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/buy/tire" onClick={() => setMobileOpen(false)}>
                  {tt("nav_tire")}
                </Link>
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/buy/parts" onClick={() => setMobileOpen(false)}>
                  {tt("nav_parts")}
                </Link>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-xs font-normal text-zinc-600">{tt("nav_rent")}</div>
              <div className="grid gap-1">
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/rent/small" onClick={() => setMobileOpen(false)}>
                  {tt("rent_small")}
                </Link>
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/rent/large" onClick={() => setMobileOpen(false)}>
                  {tt("rent_large")}
                </Link>
                <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/rent/truck" onClick={() => setMobileOpen(false)}>
                  {tt("rent_truck")}
                </Link>
              </div>
            </div>

            <div className="grid gap-2">
              <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/service" onClick={() => setMobileOpen(false)}>
                {t("nav_service")}
              </Link>
              <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/media" onClick={() => setMobileOpen(false)}>
                {t("nav_media")}
              </Link>
              <Link className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-normal" href="/sell" onClick={() => setMobileOpen(false)}>
                {t("nav_sell")}
              </Link>
            </div>

            <div className="grid gap-2">
              <LanguageSelect />
              {mounted && session ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/mypage" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" variant="outline">
                      {tt("nav_mypage")}
                    </Button>
                  </Link>
                  <Button className="w-full" variant="outline" onClick={() => (logout(), setMobileOpen(false))}>
                    {tt("auth_logout")}
                  </Button>
                </div>
              ) : mounted ? (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">{tt("auth_login")}</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" variant="outline">
                      {tt("auth_signup")}
                    </Button>
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}


