"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/context/I18nContext";

export default function HomeAppPromoSection() {
  const { t } = useI18n();

  return (
    <section className="relative w-full py-16 md:py-20 overflow-hidden">
      <div className="mx-auto w-full max-w-[1280px] px-4">
        {/* Premium Card Container */}
        <div className="relative rounded-[32px] bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 p-8 md:p-12 lg:p-16 overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)]">
          
          {/* Background Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Gradient Orbs */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-red-600/15 to-rose-500/10 rounded-full blur-3xl" />
            
            {/* Subtle Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
            
            {/* Top Highlight Line */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          {/* Content Grid */}
          <div className="relative z-10 grid gap-10 lg:grid-cols-[50%_50%] lg:items-center">
            
            {/* Left: App Mockup Image */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="relative group">
                {/* Glow Effect Behind Image */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/30 to-transparent rounded-3xl blur-2xl scale-95 group-hover:scale-100 transition-transform duration-500" />
                
                {/* Image Container with Premium Border */}
                <div className="relative w-[384px] h-[512px] overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/home/App.png"
                    alt="Mobile App"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback: show placeholder if image doesn't exist
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector(".placeholder")) {
                        const placeholder = document.createElement("div");
                        placeholder.className = "placeholder absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900";
                        placeholder.innerHTML = `
                          <div class="text-center text-zinc-500">
                            <svg class="mx-auto h-24 w-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p class="text-sm">App Image</p>
                          </div>
                        `;
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Right: Copy + Store Buttons */}
            <div className="flex flex-col gap-8 lg:pl-8">
              {/* Label with Accent */}
              <div className="inline-flex items-center gap-2">
                <span className="h-1.5 w-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
                <span className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
                {t("home_appPromo_label")}
                </span>
              </div>

              {/* Headline */}
              <h2 className="whitespace-pre-line text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                {t("home_appPromo_title")}
              </h2>

              {/* Description */}
              <p className="text-lg leading-relaxed text-zinc-400 md:text-xl max-w-lg">
                {t("home_appPromo_desc")}
              </p>

              {/* Store Buttons */}
              <div className="flex flex-wrap gap-4 pt-2">
                {/* App Store */}
                <Link
                  href="#"
                  className="group inline-flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-zinc-900 transition-all duration-300 hover:bg-zinc-100 hover:shadow-lg hover:shadow-white/10 hover:scale-[1.02]"
                  aria-label={t("home_appPromo_appStore")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-medium leading-tight text-zinc-500">Download on the</span>
                    <span className="text-base font-bold">App Store</span>
                  </div>
                </Link>

                {/* Google Play */}
                <Link
                  href="#"
                  className="group inline-flex items-center gap-3 rounded-2xl border-2 border-white/20 bg-white/5 px-6 py-4 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:shadow-lg hover:scale-[1.02]"
                  aria-label={t("home_appPromo_googlePlay")}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-7 w-7"
                    aria-hidden="true"
                  >
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[11px] font-medium leading-tight text-zinc-400">GET IT ON</span>
                    <span className="text-base font-bold">Google Play</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
