"use client";

import Link from "next/link";
import React from "react";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/context/I18nContext";
import { readMyListings, writeMyListings } from "@/features/sell/storage";
import type { MyListing, PaymentMethod, PaymentRecord, SellCategory } from "@/features/sell/types";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

export default function SellPaymentPage({ params }: { params: { category: string } }) {
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const [draftId, setDraftId] = React.useState<string | null>(null);
  const [listing, setListing] = React.useState<MyListing | null>(null);
  const [tier, setTier] = React.useState<"gold" | "silver" | "general">("general");
  const [durationDays, setDurationDays] = React.useState<number>(15);
  const [method, setMethod] = React.useState<PaymentMethod>("card");
  const [paying, setPaying] = React.useState(false);
  const [paid, setPaid] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const id = sp.get("draftId");
    setDraftId(id);
    if (!id) return;
    const list = readMyListings();
    setListing(list.find((x) => x.id === id) ?? null);
  }, []);

  const category = params.category as SellCategory;

  const plans = [
    { tier: "gold" as const, label: "Gold", options: [{ days: 5, priceMnt: 8000 }, { days: 10, priceMnt: 20000 }] },
    { tier: "silver" as const, label: "Silver", options: [{ days: 7, priceMnt: 3000 }, { days: 14, priceMnt: 6000 }] },
    { tier: "general" as const, label: "General", options: [{ days: 15, priceMnt: 0 }] },
  ];

  const selectedPlan = plans.find((p) => p.tier === tier)!;
  const selectedOption = selectedPlan.options.find((o) => o.days === durationDays) ?? selectedPlan.options[0]!;
  const amountMnt = selectedOption.priceMnt;

  React.useEffect(() => {
    // keep duration valid when tier changes
    const first = plans.find((p) => p.tier === tier)!.options[0]!;
    setDurationDays((prev) => {
      const ok = plans.find((p) => p.tier === tier)!.options.some((o) => o.days === prev);
      return ok ? prev : first.days;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tier]);

  const onPay = async () => {
    if (!draftId || !listing) return;
    setPaying(true);
    try {
      // simulate payment delay
      await new Promise((r) => setTimeout(r, 450));

      const now = new Date();
      const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

      const all = readMyListings();
      const idx = all.findIndex((x) => x.id === draftId);
      if (idx < 0) return;

      const updated: MyListing = {
        ...all[idx]!,
        status: "published",
        tier,
        durationDays,
        priceMnt: amountMnt,
        publishedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
      };

      const next = all.slice();
      next[idx] = updated;
      writeMyListings(next);
      setListing(updated);

      const paymentId =
        typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `pay_${Date.now()}`;

      const record: PaymentRecord = {
        id: paymentId,
        listingId: draftId,
        createdAt: now.toISOString(),
        method,
        tier,
        durationDays,
        amountMnt,
        status: "paid",
      };

      const payments = readLocalStorage<PaymentRecord[]>("payments", []);
      writeLocalStorage("payments", [record, ...payments]);

      setPaid(true);
    } finally {
      setPaying(false);
    }
  };

  const successHref =
    listing?.draft.category === "car" ? `/buy/all/${listing.id}` : "/mypage?tab=listings";

  return (
    <RequireAuth returnUrl={`/sell/${params.category}/payment`}>
      <div className="grid gap-6">
        <SectionTitle
          title={`${t("payment.title")} ${params.category}`}
          subtitle={t("payment.subtitle")}
        />

        {!listing ? (
          <Card>
            <CardHeader>
              <CardTitle>Draft를 찾을 수 없음</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-zinc-600">
              draftId로 저장된 매물을 찾을 수 없습니다. 폼에서 다시 제출해 주세요.
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>플랜 선택</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  {plans.map((p) => {
                    const active = p.tier === tier;
                    return (
                      <button
                        key={p.tier}
                        type="button"
                        onClick={() => setTier(p.tier)}
                        className={`rounded-2xl border p-4 text-left ${
                          active ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white hover:bg-zinc-50"
                        }`}
                      >
                        <div className="text-base font-normal">{p.label}</div>
                        <div className={`mt-1 text-sm ${active ? "text-white/80" : "text-zinc-600"}`}>
                          {p.tier === "general" ? "Free plan" : "Featured plan"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid gap-2">
                  <Label>기간</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {selectedPlan.options.map((o) => (
                      <label
                        key={`${tier}-${o.days}`}
                        className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
                          durationDays === o.days ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="duration"
                            checked={durationDays === o.days}
                            onChange={() => setDurationDays(o.days)}
                          />
                          <div className="font-normal">{o.days} days</div>
                        </div>
                        <div className="font-normal">{o.priceMnt.toLocaleString("mn-MN")} MNT</div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="text-sm text-zinc-600">
                    선택: <span className="font-normal text-zinc-900">{tier.toUpperCase()}</span> ·{" "}
                    <span className="font-normal text-zinc-900">{durationDays} days</span>
                  </div>
                  <div className="text-base font-extrabold">{amountMnt.toLocaleString("mn-MN")} MNT</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Link href={`/sell/${category}`}>
                <Button variant="outline">{t("payment.backToForm")}</Button>
              </Link>
              <Button onClick={() => setOpen(true)}>{t("common.confirm")} · 등록</Button>
            </div>
          </>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>결제 (mock)</DialogTitle>
            </DialogHeader>
            {paid ? (
              <div className="grid gap-4">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  결제가 완료되었습니다. 매물이 <span className="font-normal">PUBLISHED</span> 상태로 등록됐어요.
                </div>
                <div className="grid gap-2 text-sm text-zinc-700">
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-500">tier</div>
                    <div className="font-normal">{tier.toUpperCase()}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-500">duration</div>
                    <div className="font-normal">{durationDays} days</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-500">amount</div>
                    <div className="font-normal">{amountMnt.toLocaleString("mn-MN")} MNT</div>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    닫기
                  </Button>
                  <Link href={successHref}>
                    <Button>매물 보기</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                <div className="text-sm text-zinc-600">
                  결제수단을 선택하고 Pay를 누르면, 이 매물은 <span className="font-normal">published</span>로 전환됩니다. (prototype)
                </div>

                <div className="grid gap-2">
                  <Label>결제수단</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === "card" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
                      <input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} />
                      <div className="font-normal">Card</div>
                    </label>
                    <label className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${method === "qpay" ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:bg-zinc-50"}`}>
                      <input type="radio" name="method" checked={method === "qpay"} onChange={() => setMethod("qpay")} />
                      <div className="font-normal">QPay</div>
                    </label>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>결제 금액</Label>
                  <Input readOnly value={`${amountMnt.toLocaleString("mn-MN")} MNT`} />
                </div>

                <div className="mt-2 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setOpen(false)} disabled={paying}>
                    {t("common.cancel")}
                  </Button>
                  <Button onClick={onPay} disabled={paying || !listing}>
                    {paying ? "Paying..." : "Pay"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}


