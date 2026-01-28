"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface BannerAd {
  title: string;
  subtitle: string;
  href: string;
  imageUrl: string;
  ctaText?: string;
}

const leftAd: BannerAd = {
  title: "프리미엄 차량",
  subtitle: "검증된 최고급 차량을 만나보세요",
  href: "/buy/all?tier=gold",
  imageUrl: "/banner/banner-1.png",
  ctaText: "둘러보기",
};

const rightAd: BannerAd = {
  title: "렌탈 서비스",
  subtitle: "필요할 때 언제든 편리하게",
  href: "/rent",
  imageUrl: "/banner/banner-2.png",
  ctaText: "예약하기",
};

export function MiddleSplitBanner() {
  const [hoveredSide, setHoveredSide] = React.useState<"left" | "right" | null>(null);

  return (
    <div className="relative w-full h-[180px] sm:h-[200px] lg:h-[220px] rounded-[20px] overflow-hidden shadow-lg">
      {/* Left Panel */}
      <Link
        href={leftAd.href}
        className={[
          "absolute inset-0 transition-all duration-400 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          hoveredSide === "right" ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
        style={{
          clipPath:
            hoveredSide === "left"
              ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
              : hoveredSide === "right"
              ? "polygon(0 0, 0 0, 0 100%, 0 100%)"
              : "polygon(0 0, 55% 0, 45% 100%, 0 100%)",
          zIndex: hoveredSide === "left" ? 20 : 10,
          transition: "clip-path 400ms ease-out, opacity 300ms ease-out",
        }}
        onMouseEnter={() => setHoveredSide("left")}
        onMouseLeave={() => setHoveredSide(null)}
        onFocus={() => setHoveredSide("left")}
        onBlur={() => setHoveredSide(null)}
      >
        {/* Background Image */}
        <Image
          src={leftAd.imageUrl}
          alt={leftAd.title}
          fill
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-10 lg:px-14">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
            {leftAd.title}
          </h3>
          <p className="mt-1 text-sm sm:text-base text-white/80 drop-shadow max-w-[200px] sm:max-w-[280px]">
            {leftAd.subtitle}
          </p>
          {leftAd.ctaText && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white group">
              {leftAd.ctaText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </Link>

      {/* Right Panel */}
      <Link
        href={rightAd.href}
        className={[
          "absolute inset-0 transition-all duration-400 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
          hoveredSide === "left" ? "opacity-0 pointer-events-none" : "opacity-100",
        ].join(" ")}
        style={{
          clipPath:
            hoveredSide === "right"
              ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
              : hoveredSide === "left"
              ? "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)"
              : "polygon(55% 0, 100% 0, 100% 100%, 45% 100%)",
          zIndex: hoveredSide === "right" ? 20 : 10,
          transition: "clip-path 400ms ease-out, opacity 300ms ease-out",
        }}
        onMouseEnter={() => setHoveredSide("right")}
        onMouseLeave={() => setHoveredSide(null)}
        onFocus={() => setHoveredSide("right")}
        onBlur={() => setHoveredSide(null)}
      >
        {/* Background Image */}
        <Image
          src={rightAd.imageUrl}
          alt={rightAd.title}
          fill
          className="object-cover object-center"
          priority={false}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-end px-6 sm:px-10 lg:px-14 text-right">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white drop-shadow-lg">
            {rightAd.title}
          </h3>
          <p className="mt-1 text-sm sm:text-base text-white/80 drop-shadow max-w-[200px] sm:max-w-[280px]">
            {rightAd.subtitle}
          </p>
          {rightAd.ctaText && (
            <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white group">
              {rightAd.ctaText}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform group-hover:translate-x-1"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </Link>

      {/* Diagonal Divider Line */}
      <div
        className={[
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          hoveredSide ? "opacity-0" : "opacity-100",
        ].join(" ")}
        style={{ zIndex: 30 }}
      >
        <svg
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
        >
          <line
            x1="55"
            y1="0"
            x2="45"
            y2="100"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="0.3"
          />
        </svg>
      </div>

      {/* Subtle glow on divider */}
      <div
        className={[
          "absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] pointer-events-none transition-opacity duration-300",
          "bg-gradient-to-b from-white/0 via-white/20 to-white/0 blur-[1px]",
          hoveredSide ? "opacity-0" : "opacity-100",
        ].join(" ")}
        style={{
          zIndex: 30,
          transform: "translateX(-50%) rotate(-5deg)",
          transformOrigin: "center",
        }}
      />
    </div>
  );
}

export default MiddleSplitBanner;

