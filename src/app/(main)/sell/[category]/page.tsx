"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/context/I18nContext";
import { useAuth } from "@/context/AuthContext";
import { createDefaultDraft } from "@/features/sell/defaults";
import { readDraft, upsertMyListing, writeDraft } from "@/features/sell/storage";
import type { SellCategory, SellDraft } from "@/features/sell/types";

export default function SellFormByCategoryPage({ params }: { params: { category: string } }) {
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useAuth();

  const category = (params.category as SellCategory) || "car";
  const isValidCategory = category === "car" || category === "motorcycle" || category === "tire" || category === "parts";

  const [draft, setDraft] = React.useState<SellDraft>(() => {
    const fallback = createDefaultDraft(isValidCategory ? category : "car");
    return readDraft(isValidCategory ? category : "car", fallback);
  });

  const [memoCount, setMemoCount] = React.useState(draft.memo.length);
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [video, setVideo] = React.useState<File | null>(null);
  const [videoError, setVideoError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!session) return;
    setDraft((prev) => {
      const next = { ...prev };
      if (!next.contactName) next.contactName = session.name ?? "";
      if (!next.contactEmail) next.contactEmail = session.email ?? "";
      if (!next.contactPhone) next.contactPhone = session.phone ?? "";
      return next;
    });
  }, [session]);

  React.useEffect(() => {
    if (!isValidCategory) return;
    writeDraft(category, draft);
  }, [category, draft, isValidCategory]);

  React.useEffect(() => {
    setMemoCount(draft.memo.length);
  }, [draft.memo]);

  React.useEffect(() => {
    // cleanup previews on unmount / change
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...(prev as any), [key]: value } as SellDraft));
  };

  const onPickImages: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";

    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/gif"]);
    const next = files.filter((f) => allowed.has(f.type));
    const merged = [...images, ...next].slice(0, 20);

    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = merged.map((f) => URL.createObjectURL(f));
    setImages(merged);
    setImagePreviews(previews);
  };

  const removeImageAt = (idx: number) => {
    const nextFiles = images.filter((_, i) => i !== idx);
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    const previews = nextFiles.map((f) => URL.createObjectURL(f));
    setImages(nextFiles);
    setImagePreviews(previews);
  };

  const onPickVideo: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setVideoError(null);
    const file = (e.target.files ?? [])[0] ?? null;
    e.target.value = "";
    if (!file) return setVideo(null);

    const extOk = /\.(mpg|mp4|mov)$/i.test(file.name);
    if (!extOk) {
      setVideo(null);
      return setVideoError(t("sell.error.videoFormat"));
    }
    const max = 500 * 1024 * 1024;
    if (file.size > max) {
      setVideo(null);
      return setVideoError(t("sell.error.videoSize"));
    }
    setVideo(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = t("sell.error.imagesRequired");
    if (draft.memo.trim().length < 1) next.memo = t("sell.error.memoRequired");
    if (draft.memo.length > 10_000) next.memo = t("sell.error.memoMaxLength");
    if (!draft.contactName.trim()) next.contactName = t("sell.error.nameRequired");
    if (!draft.contactEmail.trim()) next.contactEmail = t("sell.error.emailRequired");
    if (!draft.contactPhone.trim()) next.contactPhone = t("sell.error.phoneRequired");

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = t("sell.error.required");
    };

    if (draft.category === "car") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = t("sell.error.regionRequired");
      if (!draft.hasPlate) next.hasPlate = t("sell.error.hasPlateRequired");
      if (!draft.steering) next.steering = t("sell.error.steeringRequired");
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = t("sell.error.fuelRequired");
      if (!draft.transmission) next.transmission = t("sell.error.transmissionRequired");
      require("color", draft.color);
      require("vin", draft.vin);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "motorcycle") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = t("sell.error.regionRequired");
      if (!draft.hasPlate) next.hasPlate = t("sell.error.hasPlateRequired");
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = t("sell.error.fuelRequired");
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "tire") {
      if (!draft.season) next.season = t("sell.error.seasonRequired");
      require("radius", draft.radius);
      require("width", draft.width);
      require("height", draft.height);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "parts") {
      require("title", draft.title);
      if (!draft.condition) next.condition = t("sell.error.conditionRequired");
      require("priceMnt", draft.priceMnt);
    }

    if (videoError) next.video = videoError;

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `draft_${Date.now()}`;

    upsertMyListing({
      id,
      status: "draft",
      createdAt: new Date().toISOString(),
      draft,
      media: {
        imageNames: images.map((f) => f.name),
        videoName: video?.name,
      },
    });

    router.push(`/sell/${category}/payment?draftId=${encodeURIComponent(id)}`);
  };

  if (!isValidCategory) {
    return (
      <RequireAuth returnUrl={`/sell/${params.category}`}>
        <div className="grid gap-6">
          <SectionTitle title={t("sell.title")} subtitle={t("sell.common.unsupportedCategory")} />
          <Link href="/sell">
            <Button variant="outline">{t("common.back")}</Button>
          </Link>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnUrl={`/sell/${params.category}`}>
      <div className="grid gap-6">
        <SectionTitle title={`${t("sell.formTitle")} ${category}`} subtitle={t("sell.formSubtitle")} />

        <Card>
          <CardHeader>
            <CardTitle>{t("sell.common.basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {draft.category === "car" || draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.manufacturer")}</Label>
                  <Input
                    value={draft.manufacturer}
                    onChange={(e) => setField("manufacturer", e.target.value as any)}
                    placeholder={t("sell.vehicle.manufacturerPlaceholder")}
                  />
                  {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.model")}</Label>
                  <Input
                    value={draft.model}
                    onChange={(e) => setField("model", e.target.value as any)}
                    placeholder={t("sell.vehicle.modelPlaceholder")}
                  />
                  {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.region")}</Label>
                  <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="Ulaanbaatar">{t("sell.vehicle.region.ulaanbaatar")}</option>
                    <option value="Erdenet">{t("sell.vehicle.region.erdenet")}</option>
                    <option value="Darkhan">{t("sell.vehicle.region.darkhan")}</option>
                    <option value="Other">{t("sell.vehicle.region.other")}</option>
                  </Select>
                  {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.hasPlate")}</Label>
                  <Select value={draft.hasPlate} onChange={(e) => setField("hasPlate", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="yes">{t("sell.vehicle.hasPlate.yes")}</option>
                    <option value="no">{t("sell.vehicle.hasPlate.no")}</option>
                  </Select>
                  {errors.hasPlate ? <div className="text-xs text-red-600">{errors.hasPlate}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "car" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.steering")}</Label>
                  <Select value={draft.steering} onChange={(e) => setField("steering", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="left">{t("sell.vehicle.steering.left")}</option>
                    <option value="right">{t("sell.vehicle.steering.right")}</option>
                  </Select>
                  {errors.steering ? <div className="text-xs text-red-600">{errors.steering}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.fuel")}</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="gasoline">{t("sell.vehicle.fuel.gasoline")}</option>
                    <option value="diesel">{t("sell.vehicle.fuel.diesel")}</option>
                    <option value="lpg">{t("sell.vehicle.fuel.lpg")}</option>
                    <option value="electric">{t("sell.vehicle.fuel.electric")}</option>
                    <option value="hybrid">{t("sell.vehicle.fuel.hybrid")}</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.transmission")}</Label>
                  <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                    <option value="">{t("sell.vehicle.transmission.select")}</option>
                    <option value="automatic">{t("sell.vehicle.transmission.automatic")}</option>
                    <option value="manual">{t("sell.vehicle.transmission.manual")}</option>
                  </Select>
                  {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.yearMade")}</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder={t("sell.vehicle.yearMadePlaceholder")} />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.yearImported")}</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder={t("sell.vehicle.yearImportedPlaceholder")}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.color")}</Label>
                  <Input value={draft.color} onChange={(e) => setField("color", e.target.value as any)} placeholder={t("sell.vehicle.colorPlaceholder")} />
                  {errors.color ? <div className="text-xs text-red-600">{errors.color}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.vin")}</Label>
                  <Input value={draft.vin} onChange={(e) => setField("vin", e.target.value as any)} placeholder={t("sell.vehicle.vinPlaceholder")} />
                  {errors.vin ? <div className="text-xs text-red-600">{errors.vin}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.yearMade")}</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder={t("sell.motorcycle.yearMadePlaceholder")} />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.yearImported")}</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder={t("sell.motorcycle.yearImportedPlaceholder")}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell.vehicle.fuel")}</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="gasoline">{t("sell.motorcycle.fuel.gasoline")}</option>
                    <option value="electric">{t("sell.motorcycle.fuel.electric")}</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "tire" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell.tire.season")}</Label>
                  <Select value={draft.season} onChange={(e) => setField("season", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="all-season">{t("sell.tire.season.allSeason")}</option>
                    <option value="winter">{t("sell.tire.season.winter")}</option>
                    <option value="summer">{t("sell.tire.season.summer")}</option>
                  </Select>
                  {errors.season ? <div className="text-xs text-red-600">{errors.season}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.tire.radius")}</Label>
                  <Input value={draft.radius} onChange={(e) => setField("radius", e.target.value as any)} placeholder={t("sell.tire.radiusPlaceholder")} />
                  {errors.radius ? <div className="text-xs text-red-600">{errors.radius}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.tire.width")}</Label>
                  <Input value={draft.width} onChange={(e) => setField("width", e.target.value as any)} placeholder={t("sell.tire.widthPlaceholder")} />
                  {errors.width ? <div className="text-xs text-red-600">{errors.width}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.tire.height")}</Label>
                  <Input value={draft.height} onChange={(e) => setField("height", e.target.value as any)} placeholder={t("sell.tire.heightPlaceholder")} />
                  {errors.height ? <div className="text-xs text-red-600">{errors.height}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "parts" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label>{t("sell.parts.title")}</Label>
                  <Input value={draft.title} onChange={(e) => setField("title", e.target.value as any)} placeholder={t("sell.parts.titlePlaceholder")} />
                  {errors.title ? <div className="text-xs text-red-600">{errors.title}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell.parts.condition")}</Label>
                  <Select value={draft.condition} onChange={(e) => setField("condition", e.target.value as any)}>
                    <option value="">{t("sell.common.select")}</option>
                    <option value="new">{t("sell.parts.condition.new")}</option>
                    <option value="used">{t("sell.parts.condition.used")}</option>
                  </Select>
                  {errors.condition ? <div className="text-xs text-red-600">{errors.condition}</div> : null}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2 sm:max-w-sm">
              <Label>{t("sell.vehicle.price")}</Label>
              <Input
                value={(draft as any).priceMnt ?? ""}
                onChange={(e) => setField("priceMnt" as any, e.target.value as any)}
                placeholder={t("sell.vehicle.pricePlaceholder")}
              />
              {errors.priceMnt ? <div className="text-xs text-red-600">{errors.priceMnt}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell.common.photos")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("sell.common.imageUpload")}</Label>
              <Input
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                onChange={onPickImages}
              />
              {errors.images ? <div className="text-xs text-red-600">{errors.images}</div> : null}
              {imagePreviews.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div key={src} className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`upload-${idx}`} className="h-20 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute right-1 top-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white"
                      >
                        {t("sell.common.delete")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>{t("sell.common.videoUpload")}</Label>
              <Input type="file" accept=".mpg,.mp4,.mov" onChange={onPickVideo} />
              {video ? <div className="text-xs text-zinc-600">{t("sell.common.selected")}: {video.name}</div> : null}
              {errors.video ? <div className="text-xs text-red-600">{errors.video}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell.common.memo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.memo}
              maxLength={10_000}
              onChange={(e) => setField("memo", e.target.value as any)}
              placeholder={t("sell.common.memoPlaceholder")}
            />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>{errors.memo ? <span className="text-red-600">{errors.memo}</span> : null}</div>
              <div>
                {memoCount.toLocaleString()} / 10,000
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell.common.contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("sell.contact.name")}</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value as any)}
                placeholder={t("sell.contact.namePlaceholder")}
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell.contact.email")}</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value as any)}
                placeholder={t("sell.contact.emailPlaceholder")}
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell.contact.phone")}</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value as any)}
                placeholder={t("sell.contact.phonePlaceholder")}
              />
              {errors.contactPhone ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/sell">
            <Button variant="outline">{t("common.back")}</Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                const fallback = createDefaultDraft(category);
                setDraft(fallback);
                setImages([]);
                imagePreviews.forEach((u) => URL.revokeObjectURL(u));
                setImagePreviews([]);
                setVideo(null);
                setErrors({});
              }}
            >
              {t("sell.common.reset")}
            </Button>
            <Button variant="primary" onClick={onSubmit}>{t("sell.form.continueToPayment")}</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {t("sell.common.draftAutoSave")}: <span className="font-mono">sellDraft:{category}</span>
        </div>
      </div>
    </RequireAuth>
  );
}


