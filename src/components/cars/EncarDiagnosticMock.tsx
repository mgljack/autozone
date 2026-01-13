"use client";

import React from "react";

import { useI18n } from "@/context/I18nContext";

type ReplaceablePart = "front_bumper" | "hood" | "left_door" | "right_door" | "trunk";

function hashString(input: string): number {
  // simple deterministic hash (prototype)
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickReplacedParts(carId: string): ReplaceablePart[] {
  const parts: ReplaceablePart[] = ["front_bumper", "hood", "left_door", "right_door", "trunk"];
  const h = hashString(carId);
  const count = h % 3; // 0..2
  if (count === 0) return [];

  const picked: ReplaceablePart[] = [];
  let x = h;
  while (picked.length < count) {
    x = (x * 1664525 + 1013904223) >>> 0;
    const idx = x % parts.length;
    const p = parts[idx]!;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked;
}

function labelForPart(p: ReplaceablePart, t: (key: string) => string) {
  if (p === "front_bumper") return t("vehicleStatus.parts.frontBumper");
  if (p === "hood") return t("vehicleStatus.parts.hood");
  if (p === "left_door") return t("vehicleStatus.parts.leftDoor");
  if (p === "right_door") return t("vehicleStatus.parts.rightDoor");
  return t("vehicleStatus.parts.trunk");
}

export function EncarDiagnosticMock({ carId, title }: { carId: string; title?: string }) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scanOn] = React.useState(true);

  const replacedParts = React.useMemo(() => pickReplacedParts(carId), [carId]);
  const hasReplaced = replacedParts.length > 0;

  const rows = React.useMemo(
    () => [
      { label: t("vehicleStatus.parts.frameInspection"), status: t("vehicleStatus.status.normal") as string, tone: "ok" as const },
      { label: t("vehicleStatus.parts.exteriorPanel"), status: hasReplaced ? (t("vehicleStatus.status.replaced") as string) : (t("vehicleStatus.status.normal") as string), tone: hasReplaced ? ("warn" as const) : ("ok" as const) },
      { label: t("vehicleStatus.parts.mainStructure"), status: t("vehicleStatus.status.normal") as string, tone: "ok" as const },
      { label: t("vehicleStatus.parts.paintSurface"), status: hasReplaced ? (t("vehicleStatus.status.replaced") as string) : (t("vehicleStatus.status.normal") as string), tone: hasReplaced ? ("warn" as const) : ("ok" as const) },
    ],
    [hasReplaced, t],
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="text-sm font-normal text-zinc-900">{title ?? t("vehicleStatus.title")}</div>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
        {/* Left: summary */}
        <div className="grid gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <div className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white">
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M20 6 9 17l-5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-normal text-zinc-900">{t("vehicleStatus.diagnostic.completed")}</div>
            </div>
          </div>

          <div className="grid gap-2">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3"
              >
                <div className="text-sm font-normal text-zinc-700">{r.label}</div>
                <div
                  className={[
                    "text-xs font-extrabold uppercase tracking-wide",
                    r.tone === "ok" ? "text-emerald-600" : "text-orange-600",
                  ].join(" ")}
                >
                  {r.status}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-normal text-zinc-900 hover:bg-zinc-50"
            onClick={() => setIsOpen((v) => !v)}
          >
            {t("vehicleStatus.diagnostic.viewDetails")}
          </button>

          {isOpen ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-700">
              <div className="font-normal text-zinc-900">{t("vehicleStatus.diagnostic.details")}</div>
              <div className="mt-2 grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600">{t("vehicleStatus.diagnostic.replacedParts")}</span>
                  <span className={hasReplaced ? "font-normal text-orange-700" : "font-normal text-emerald-700"}>
                    {hasReplaced ? replacedParts.length : 0}
                  </span>
                </div>
                {hasReplaced ? (
                  <ul className="list-disc pl-5">
                    {replacedParts.map((p) => (
                      <li key={p}>
                        <span className="font-normal">{labelForPart(p, t)}</span> — {t("vehicleStatus.diagnostic.markedAs")} <span className="text-orange-700 font-normal">{t("vehicleStatus.status.replaced")}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-zinc-600">{t("vehicleStatus.diagnostic.noReplacedParts")}</div>
                )}
                <div className="pt-1 text-xs text-zinc-500">
                  {t("vehicleStatus.diagnostic.simulationNote")}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Right: scan animation + SVG */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-b from-zinc-950 to-zinc-900">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -left-16 -top-20 h-72 w-72 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-400 blur-3xl" />
          </div>

          <div className="relative p-6">
            <div className="text-xs font-normal text-white/70">{t("vehicleStatus.scan.diagnostic")}</div>
            <div className="mt-1 text-sm font-normal text-white">
              {t("vehicleStatus.scan.scanningText")} {hasReplaced ? t("vehicleStatus.scan.replacedDetected") : t("vehicleStatus.scan.noReplacedDetected")}
            </div>

            <div className="relative mt-4 aspect-[16/10] w-full rounded-2xl border border-white/10 bg-black/35">
              {/* enhanced grid */}
              <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px]" />
              <div className="encar-noise absolute inset-0 opacity-[0.06]" aria-hidden="true" />

              {/* HUD: top status bar */}
              <div className="absolute left-4 right-4 top-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/90" />
                  <span className="font-normal text-white/80">{t("vehicleStatus.scan.live")}</span>
                  <span className="text-white/50">•</span>
                  <span>{t("vehicleStatus.scan.blueprint")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="encar-bar h-2 w-8 rounded-sm" />
                  <span className="encar-bar h-2 w-5 rounded-sm opacity-70" />
                  <span className="encar-bar h-2 w-3 rounded-sm opacity-40" />
                </div>
              </div>

              {/* HUD: corner brackets */}
              <div className="encar-corner tl" aria-hidden="true" />
              <div className="encar-corner tr" aria-hidden="true" />
              <div className="encar-corner bl" aria-hidden="true" />
              <div className="encar-corner br" aria-hidden="true" />

              {/* Radar pulse behind vehicle */}
              <div className="encar-radar absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />

              {/* Scan beams */}
              {scanOn ? (
                <>
                  <div className="encar-scan-line absolute left-0 right-0 top-0 h-5" />
                  <div className="encar-scan-line-2 absolute left-0 right-0 top-0 h-3" />
                </>
              ) : null}

              {/* SVG vehicle (blueprint style) */}
              <div className="absolute inset-0 grid place-items-center p-4">
                <svg viewBox="0 0 520 300" className="h-full w-full max-w-[520px]" role="img" aria-label="Vehicle diagnostic illustration">
                  <defs>
                    <linearGradient id="bpStroke" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="rgba(56,189,248,0.55)" />
                      <stop offset="0.5" stopColor="rgba(99,102,241,0.55)" />
                      <stop offset="1" stopColor="rgba(56,189,248,0.55)" />
                    </linearGradient>
                    <linearGradient id="bpFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
                      <stop offset="1" stopColor="rgba(255,255,255,0.04)" />
                    </linearGradient>
                    <radialGradient id="bpGlow" cx="50%" cy="45%" r="70%">
                      <stop offset="0" stopColor="rgba(56,189,248,0.22)" />
                      <stop offset="1" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                    <filter id="bpOuterGlow" x="-30%" y="-30%" width="160%" height="160%">
                      <feGaussianBlur stdDeviation="2.8" result="blur" />
                      <feColorMatrix
                        in="blur"
                        type="matrix"
                        values="0 0 0 0 0.22  0 0 0 0 0.85  0 0 0 0 1  0 0 0 1 0"
                        result="colored"
                      />
                      <feMerge>
                        <feMergeNode in="colored" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Ambient glow */}
                  <ellipse cx="260" cy="150" rx="210" ry="120" fill="url(#bpGlow)" opacity="0.9" />

                  {/* Base vehicle group */}
                  <g className="encar-blueprint">
                    {/* Shadow platform */}
                    <ellipse cx="260" cy="236" rx="180" ry="34" fill="rgba(0,0,0,0.35)" opacity="0.45" />

                    {/* Main body */}
                    <path
                      d="M85 195c18-52 60-95 125-102h100c65 7 107 50 125 102l18 35c5 10-3 20-15 20H82c-12 0-20-10-15-20l18-35Z"
                      fill="url(#bpFill)"
                      stroke="url(#bpStroke)"
                      strokeWidth="2.4"
                      filter="url(#bpOuterGlow)"
                    />

                    {/* Cabin / windows */}
                    <path
                      d="M195 112h130c35 4 60 30 72 68H123c12-38 37-64 72-68Z"
                      fill="rgba(255,255,255,0.06)"
                      stroke="rgba(255,255,255,0.16)"
                      strokeWidth="2"
                    />
                    <path
                      d="M220 126h60c18 2 32 14 38 36h-136c6-22 20-34 38-36Z"
                      fill="rgba(0,0,0,0.18)"
                      stroke="rgba(255,255,255,0.10)"
                      strokeWidth="1.6"
                    />

                    {/* Lights hints */}
                    <path d="M95 200h38l-6 16H89l6-16Z" fill="rgba(255,255,255,0.08)" stroke="rgba(56,189,248,0.35)" strokeWidth="1.6" />
                    <path d="M387 200h38l6 16h-38l-6-16Z" fill="rgba(255,255,255,0.08)" stroke="rgba(99,102,241,0.35)" strokeWidth="1.6" />

                    {/* Wheel assemblies */}
                    <g>
                      <circle cx="165" cy="235" r="34" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.16)" strokeWidth="2.2" />
                      <circle cx="165" cy="235" r="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" />
                      <path d="M165 217v36M147 235h36M153 223l24 24M177 223l-24 24" stroke="rgba(255,255,255,0.10)" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                    <g>
                      <circle cx="355" cy="235" r="34" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.16)" strokeWidth="2.2" />
                      <circle cx="355" cy="235" r="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" />
                      <path d="M355 217v36M337 235h36M343 223l24 24M367 223l-24 24" stroke="rgba(255,255,255,0.10)" strokeWidth="1.4" strokeLinecap="round" />
                    </g>
                  </g>

                  {/* Replaceable parts (must keep ids) */}
                  <g
                    id="front_bumper"
                    className={replacedParts.includes("front_bumper") ? "encar-part detached" : "encar-part"}
                  >
                    <path
                      d="M72 198h82l-10 28H60l12-28Z"
                      fill="rgba(56,189,248,0.14)"
                      stroke="rgba(56,189,248,0.42)"
                      strokeWidth="2.2"
                    />
                    <path d="M86 210h48" stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round" />
                  </g>

                  <g id="hood" className={replacedParts.includes("hood") ? "encar-part detached" : "encar-part"}>
                    <path
                      d="M185 156h150l-14 34H199l-14-34Z"
                      fill="rgba(56,189,248,0.12)"
                      stroke="rgba(56,189,248,0.38)"
                      strokeWidth="2.2"
                    />
                    <path d="M205 168h110" stroke="rgba(255,255,255,0.12)" strokeWidth="1.6" strokeLinecap="round" />
                  </g>

                  <g id="left_door" className={replacedParts.includes("left_door") ? "encar-part detached" : "encar-part"}>
                    <path
                      d="M200 192h70v34h-80l10-34Z"
                      fill="rgba(56,189,248,0.12)"
                      stroke="rgba(56,189,248,0.38)"
                      strokeWidth="2.2"
                    />
                    <circle cx="240" cy="208" r="2.2" fill="rgba(255,255,255,0.22)" />
                  </g>

                  <g id="right_door" className={replacedParts.includes("right_door") ? "encar-part detached" : "encar-part"}>
                    <path
                      d="M270 192h70l10 34h-80v-34Z"
                      fill="rgba(56,189,248,0.12)"
                      stroke="rgba(56,189,248,0.38)"
                      strokeWidth="2.2"
                    />
                    <circle cx="310" cy="208" r="2.2" fill="rgba(255,255,255,0.22)" />
                  </g>

                  <g id="trunk" className={replacedParts.includes("trunk") ? "encar-part detached" : "encar-part"}>
                    <path
                      d="M366 198h82l12 28h-84l-10-28Z"
                      fill="rgba(56,189,248,0.14)"
                      stroke="rgba(99,102,241,0.42)"
                      strokeWidth="2.2"
                    />
                    <path d="M392 210h40" stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          <style>{`
            .encar-scan-line {
              background: linear-gradient(90deg, transparent, rgba(56,189,248,0.08), rgba(56,189,248,0.95), rgba(56,189,248,0.08), transparent);
              box-shadow: 0 0 22px rgba(56,189,248,0.55);
              filter: blur(0.3px);
              animation: encarScan 2.6s linear infinite;
              opacity: 0.92;
            }

            .encar-scan-line-2 {
              background: linear-gradient(90deg, transparent, rgba(99,102,241,0.55), transparent);
              box-shadow: 0 0 14px rgba(99,102,241,0.45);
              filter: blur(0.7px);
              animation: encarScan2 2.6s linear infinite;
              opacity: 0.6;
            }

            @keyframes encarScan {
              0% { transform: translateY(0); opacity: 0.18; }
              10% { opacity: 0.95; }
              90% { opacity: 0.95; }
              100% { transform: translateY(100%); opacity: 0.18; }
            }

            @keyframes encarScan2 {
              0% { transform: translateY(12px); opacity: 0.05; }
              15% { opacity: 0.65; }
              85% { opacity: 0.65; }
              100% { transform: translateY(calc(100% + 12px)); opacity: 0.05; }
            }

            .encar-blueprint path,
            .encar-blueprint circle {
              animation: encarReveal 2.6s ease-in-out infinite;
            }

            @keyframes encarReveal {
              0%, 18% { filter: none; opacity: 0.92; }
              38% { filter: drop-shadow(0 0 8px rgba(56,189,248,0.25)); opacity: 1; }
              60% { filter: drop-shadow(0 0 10px rgba(56,189,248,0.30)); opacity: 1; }
              100% { filter: none; opacity: 0.92; }
            }

            .encar-part {
              transition: transform 420ms ease, filter 420ms ease;
              transform-box: fill-box;
              transform-origin: center;
              filter: drop-shadow(0 0 0 rgba(0,0,0,0));
            }

            .encar-part.detached {
              transform: translate(10px, -6px) rotate(0.6deg);
              filter: drop-shadow(0 12px 18px rgba(0,0,0,0.45)) drop-shadow(0 0 14px rgba(56,189,248,0.28));
            }

            .encar-part.detached path {
              stroke: rgba(251,146,60,0.65);
            }

            .encar-bar {
              background: linear-gradient(90deg, rgba(56,189,248,0.85), rgba(99,102,241,0.65));
              box-shadow: 0 0 10px rgba(56,189,248,0.35);
            }

            .encar-corner {
              position: absolute;
              width: 28px;
              height: 28px;
              border: 2px solid rgba(56,189,248,0.28);
              border-radius: 10px;
              box-shadow: 0 0 14px rgba(56,189,248,0.12);
            }
            .encar-corner.tl { left: 14px; top: 14px; border-right: 0; border-bottom: 0; }
            .encar-corner.tr { right: 14px; top: 14px; border-left: 0; border-bottom: 0; }
            .encar-corner.bl { left: 14px; bottom: 14px; border-right: 0; border-top: 0; }
            .encar-corner.br { right: 14px; bottom: 14px; border-left: 0; border-top: 0; }

            .encar-noise {
              background-image:
                radial-gradient(circle at 20% 30%, rgba(255,255,255,0.12) 0.5px, transparent 0.6px),
                radial-gradient(circle at 80% 60%, rgba(255,255,255,0.10) 0.5px, transparent 0.6px),
                radial-gradient(circle at 40% 80%, rgba(255,255,255,0.08) 0.5px, transparent 0.6px);
              background-size: 160px 120px, 180px 140px, 200px 160px;
              mix-blend-mode: overlay;
              pointer-events: none;
            }

            .encar-radar {
              width: 220px;
              height: 220px;
              border-radius: 9999px;
              border: 1px solid rgba(56,189,248,0.18);
              box-shadow: 0 0 30px rgba(56,189,248,0.10);
              background:
                radial-gradient(circle at center, rgba(56,189,248,0.12), transparent 60%),
                radial-gradient(circle at center, transparent 52%, rgba(56,189,248,0.16) 53%, transparent 54%),
                radial-gradient(circle at center, transparent 30%, rgba(56,189,248,0.14) 31%, transparent 32%);
              animation: encarRadarPulse 2.8s ease-in-out infinite;
              pointer-events: none;
              opacity: 0.35;
            }

            @keyframes encarRadarPulse {
              0%, 100% { transform: translate(-50%, -50%) scale(0.98); opacity: 0.26; }
              55% { transform: translate(-50%, -50%) scale(1.03); opacity: 0.40; }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}


