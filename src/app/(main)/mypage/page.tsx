"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import { useFavorites } from "@/features/favorites/favorites";
import { useRecentCars } from "@/features/recent/recent";
import { readMyListings, writeMyListings } from "@/features/sell/storage";
import type { ListingStatus, MyListing } from "@/features/sell/types";
import { readLocalStorage, writeLocalStorage } from "@/lib/storage";
import { cars as mockCars } from "@/mock/cars";

export default function MyPage() {
  const router = useRouter();
  const { session, logout, updateProfile, deleteAccount } = useAuth();
  const { t } = useI18n();
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { recent, clearRecent } = useRecentCars();

  const [notif, setNotif] = React.useState(() =>
    readLocalStorage<{ marketing: boolean; email: boolean; push: boolean }>("turbo.notifications", {
      marketing: true,
      email: true,
      push: true,
    }),
  );

  const [profileName, setProfileName] = React.useState("");
  const [profileEmail, setProfileEmail] = React.useState("");
  const [profilePhone, setProfilePhone] = React.useState("");
  const [profileMsg, setProfileMsg] = React.useState<string | null>(null);

  const [listings, setListings] = React.useState<MyListing[]>([]);
  const [listingTab, setListingTab] = React.useState<
    "all" | "published" | "reviewing" | "expired" | "rejected" | "deleted"
  >("all");

  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  React.useEffect(() => {
    setListings(readMyListings());
  }, []);

  React.useEffect(() => {
    if (!session) return;
    setProfileName(session.name ?? "");
    setProfileEmail(session.email ?? "");
    setProfilePhone(session.phone ?? "");
  }, [session]);

  const saveNotif = (next: { marketing: boolean; email: boolean; push: boolean }) => {
    setNotif(next);
    writeLocalStorage("turbo.notifications", next);
  };

  const isExpired = React.useCallback((x: MyListing) => {
    if (!x.expiresAt) return false;
    return new Date(x.expiresAt).getTime() <= Date.now();
  }, []);

  const filteredListings = React.useMemo(() => {
    if (listingTab === "all") return listings;
    if (listingTab === "published") return listings.filter((x) => x.status === "published" && !isExpired(x));
    if (listingTab === "reviewing") return listings.filter((x) => x.status === "reviewing");
    if (listingTab === "rejected") return listings.filter((x) => x.status === "rejected");
    if (listingTab === "deleted") return listings.filter((x) => x.status === "deleted");
    return listings.filter((x) => x.status === "published" && isExpired(x));
  }, [isExpired, listingTab, listings]);

  const counts = React.useMemo(() => {
    const all = listings.length;
    const published = listings.filter((x) => x.status === "published" && !isExpired(x)).length;
    const expired = listings.filter((x) => x.status === "published" && isExpired(x)).length;
    const reviewing = listings.filter((x) => x.status === "reviewing").length;
    const rejected = listings.filter((x) => x.status === "rejected").length;
    const deleted = listings.filter((x) => x.status === "deleted").length;
    return { all, published, reviewing, expired, rejected, deleted };
  }, [isExpired, listings]);

  const updateListingStatus = (id: string, nextStatus: ListingStatus) => {
    setListings((prev) => {
      const next: MyListing[] = prev.map((x) => {
        if (x.id !== id) return x;
        if (nextStatus !== "published") return { ...x, status: nextStatus } as MyListing;

        // When simulating publish, ensure basic publish metadata exists
        const now = new Date();
        const durationDays = x.durationDays ?? 15;
        const expiresAt = x.expiresAt ?? new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        const updated: MyListing = {
          ...x,
          status: "published",
          tier: x.tier ?? "general",
          durationDays,
          priceMnt: x.priceMnt ?? 0,
          publishedAt: x.publishedAt ?? now.toISOString(),
          expiresAt,
        };
        return updated;
      });
      writeMyListings(next);
      return next;
    });
  };

  const itemTitle = (id: string) => {
    const foundMock = mockCars.find((c) => c.id === id);
    if (foundMock) return `${foundMock.manufacturer} ${foundMock.model} ${foundMock.subModel}`.trim();
    const foundListing = listings.find((x) => x.id === id);
    if (foundListing?.draft.category === "car") {
      const d = foundListing.draft as any;
      return `${d.manufacturer ?? ""} ${d.model ?? ""}`.trim() || id;
    }
    return id;
  };

  return (
    <div className="grid gap-6">
      <SectionTitle title={t("mypage.title")} subtitle={t("mypage.subtitle")} />
      {!session ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6">
          <div className="text-sm text-zinc-600">{t("mypage.notSignedIn")}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/login">
              <Button>{t("mypage.goLogin")}</Button>
            </Link>
            <Link href="/buy/all">
              <Button variant="outline">{t("mypage.browse")}</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* My listings */}
          <Card>
            <CardHeader>
              <CardTitle>{t("mypage.myListings.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={listingTab} onValueChange={(v) => setListingTab(v as any)} defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">{t("mypage.tab.all")} ({counts.all})</TabsTrigger>
                  <TabsTrigger value="published">{t("mypage.tab.published")} ({counts.published})</TabsTrigger>
                  <TabsTrigger value="reviewing">{t("mypage.tab.reviewing")} ({counts.reviewing})</TabsTrigger>
                  <TabsTrigger value="expired">{t("mypage.tab.expired")} ({counts.expired})</TabsTrigger>
                  <TabsTrigger value="rejected">{t("mypage.tab.rejected")} ({counts.rejected})</TabsTrigger>
                  <TabsTrigger value="deleted">{t("mypage.tab.deleted")} ({counts.deleted})</TabsTrigger>
                </TabsList>

                <TabsContent value={listingTab}>
                  {filteredListings.length ? (
                    <div className="grid gap-2">
                      {filteredListings.map((x) => {
                        const title = x.draft.category === "parts" ? x.draft.title : x.id;
                        const displayTitle =
                          x.draft.category === "car"
                            ? `${(x.draft as any).manufacturer ?? ""} ${(x.draft as any).model ?? ""}`.trim() || x.id
                            : x.draft.category === "motorcycle"
                              ? `${(x.draft as any).manufacturer ?? ""} ${(x.draft as any).model ?? ""}`.trim() || x.id
                              : x.draft.category === "tire"
                                ? `${t("mypage.tirePrefix")} ${(x.draft as any).radius ?? ""} ${(x.draft as any).width ?? ""}/${(x.draft as any).height ?? ""}`.trim()
                                : title;

                        const expired = isExpired(x);
                        const statusLabel =
                          x.status === "published"
                            ? expired
                              ? t("mypage.status.expired")
                              : t("mypage.status.published")
                            : t(`mypage.status.${x.status}`);

                        return (
                          <div
                            key={x.id}
                            className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-normal text-zinc-900">{displayTitle}</div>
                              <div className="mt-1 text-xs text-zinc-600">
                                {t("mypage.listing.statusLabel")}: <span className="font-normal">{statusLabel}</span>
                                {x.tier ? (
                                  <>
                                    {" "}
                                    · {t("mypage.listing.tierLabel")}: <span className="font-normal">{x.tier}</span>
                                  </>
                                ) : null}
                                {x.expiresAt ? (
                                  <>
                                    {" "}
                                    · {t("mypage.listing.expiresLabel")}:{" "}
                                    <span className="font-normal">
                                      {new Date(x.expiresAt).toLocaleDateString("mn-MN")}
                                    </span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {x.draft.category === "car" ? (
                                <Link href={`/buy/all/${x.id}`}>
                                  <Button variant="outline">{t("mypage.listing.view")}</Button>
                                </Link>
                              ) : null}
                              <select
                                className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm"
                                value={x.status}
                                onChange={(e) => updateListingStatus(x.id, e.target.value as ListingStatus)}
                              >
                                <option value="draft">{t("mypage.status.draft")}</option>
                                <option value="published">{t("mypage.status.published")}</option>
                                <option value="reviewing">{t("mypage.status.reviewing")}</option>
                                <option value="rejected">{t("mypage.status.rejected")}</option>
                                <option value="deleted">{t("mypage.status.deleted")}</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-600">{t("mypage.none")}</div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Favorites + Recent */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("mypage.favorites.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {favoriteIds.length ? (
                  favoriteIds.slice(0, 10).map((id) => (
                    <div key={id} className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3">
                      <Link href={`/buy/all/${id}`} className="min-w-0 hover:underline">
                        <div className="truncate text-sm font-normal">{itemTitle(id)}</div>
                        <div className="mt-1 text-xs text-zinc-600">{id}</div>
                      </Link>
                      <Button variant="outline" onClick={() => toggleFavorite(id)}>
                        {t("common.remove")}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-zinc-600">{t("home.left.none")}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("mypage.recent.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                {recent.length ? (
                  <>
                    <div className="flex justify-end">
                      <Button variant="outline" onClick={clearRecent}>
                        {t("common.clearAll")}
                      </Button>
                    </div>
                    {recent.slice(0, 10).map((r) => (
                      <Link
                        key={r.id}
                        href={`/buy/all/${r.id}`}
                        className="rounded-xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50"
                      >
                        <div className="truncate text-sm font-normal">{itemTitle(r.id)}</div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {new Date(r.viewedAt).toLocaleString("mn-MN")}
                        </div>
                      </Link>
                    ))}
                  </>
                ) : (
                  <div className="text-sm text-zinc-600">{t("home.left.none")}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile */}
          <Card>
            <CardHeader>
              <CardTitle>{t("mypage.profile.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {profileMsg ? <div className="text-sm text-zinc-700">{profileMsg}</div> : null}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="grid gap-2">
                  <Label>{t("mypage.profile.name")}</Label>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("mypage.profile.email")}</Label>
                  <Input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label>{t("mypage.profile.phone")}</Label>
                  <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setProfileMsg(null);
                    const res = updateProfile({
                      name: profileName,
                      email: profileEmail || undefined,
                      phone: profilePhone || undefined,
                    });
                    if (!res.ok) return setProfileMsg(res.error);
                    setProfileMsg(t("mypage.profile.saved"));
                  }}
                >
                  {t("mypage.profile.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>{t("mypage.notifications.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <div className="font-normal">{t("mypage.notifications.marketing")}</div>
                <input
                  type="checkbox"
                  checked={notif.marketing}
                  onChange={(e) => saveNotif({ ...notif, marketing: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <div className="font-normal">{t("mypage.notifications.email")}</div>
                <input
                  type="checkbox"
                  checked={notif.email}
                  onChange={(e) => saveNotif({ ...notif, email: e.target.checked })}
                />
              </label>
              <label className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
                <div className="font-normal">{t("mypage.notifications.push")}</div>
                <input
                  type="checkbox"
                  checked={notif.push}
                  onChange={(e) => saveNotif({ ...notif, push: e.target.checked })}
                />
              </label>
              <div className="text-xs text-zinc-500">localStorage['turbo.notifications']</div>
            </CardContent>
          </Card>

          {/* Account actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("mypage.account.title")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
              >
                {t("mypage.logout")}
              </Button>
              <Button variant="destructive" onClick={() => setWithdrawOpen(true)}>
                {t("mypage.withdraw")}
              </Button>
            </CardContent>
          </Card>

          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("mypage.withdraw.title")}</DialogTitle>
              </DialogHeader>
              <div className="text-sm text-zinc-600">
                {t("mypage.withdraw.body")}
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteAccount();
                    setWithdrawOpen(false);
                    router.push("/");
                  }}
                >
                  {t("mypage.withdraw.confirm")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}


