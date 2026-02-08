"use client";

import Link from "next/link";

import { useI18n } from "@/context/I18nContext";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-zinc-200 bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4">
        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          {/* Left block */}
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-zinc-800">
              <Link className="hover:underline" href="/about">
                {t("footer_about")}
              </Link>
              <Link className="hover:underline" href="/terms">
                {t("footer_terms")}
              </Link>
              <Link className="hover:underline" href="/notice">
                {t("footer_notice")}
              </Link>
              <Link className="hover:underline" href="/guide">
                {t("footer_guide")}
              </Link>
            </div>

            <div className="text-xs text-zinc-500">
              <div>© {new Date().getFullYear()} AutoZone.mn ({t("app_prototype")})</div>
              <div className="mt-1">{t("footer_companyDisclaimer")}</div>
            </div>
          </div>

          {/* Right block */}
          <div className="grid gap-4 md:justify-items-end">
            <div className="grid gap-2">
              <div className="text-sm font-normal text-zinc-900">{t("footer_customerCenter")}</div>
              <div className="text-sm text-zinc-600">
                {t("footer_hoursLabel")} {t("footer_hoursValue")}
              </div>
              <div className="text-3xl font-normal tracking-tight text-zinc-900">1533-6451</div>
            </div>

            <div className="flex items-center gap-2 md:justify-end">
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 transition-colors hover:bg-zinc-300"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 transition-colors hover:bg-zinc-300"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-800 transition-colors hover:bg-zinc-300"
                aria-label="YouTube"
              >
                <YouTubeIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.7-1.6H16.8V4.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H7.5v3H10v8h3.5Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M7.5 3.5h9A4 4 0 0 1 20.5 7.5v9a4 4 0 0 1-4 4h-9a4 4 0 0 1-4-4v-9a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.2a4.2 4.2 0 1 0 0-8.4 4.2 4.2 0 0 0 0 8.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M17.3 6.7h.01" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 12s0-3.5-.4-5.1a2.6 2.6 0 0 0-1.8-1.8C17.2 4.7 12 4.7 12 4.7s-5.2 0-6.8.4A2.6 2.6 0 0 0 3.4 7C3 8.5 3 12 3 12s0 3.5.4 5.1a2.6 2.6 0 0 0 1.8 1.8c1.6.4 6.8.4 6.8.4s5.2 0 6.8-.4a2.6 2.6 0 0 0 1.8-1.8C21 15.5 21 12 21 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10.5 9.5 15 12l-4.5 2.5V9.5Z" fill="currentColor" />
    </svg>
  );
}


