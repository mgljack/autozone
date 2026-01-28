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
      return setVideoError(t("sell_error_videoFormat"));
    }
    const max = 500 * 1024 * 1024;
    if (file.size > max) {
      setVideo(null);
      return setVideoError(t("sell_error_videoSize"));
    }
    setVideo(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = t("sell_error_imagesRequired");
    if (draft.memo.trim().length < 1) next.memo = t("sell_error_memoRequired");
    if (draft.memo.length > 10_000) next.memo = t("sell_error_memoMaxLength");
    if (!draft.contactName.trim()) next.contactName = t("sell_error_nameRequired");
    if (!draft.contactEmail.trim()) next.contactEmail = t("sell_error_emailRequired");
    if (!draft.contactPhone.trim()) next.contactPhone = t("sell_error_phoneRequired");

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = t("sell_error_required");
    };

    if (draft.category === "car") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = t("sell_error_regionRequired");
      if (!draft.hasPlate) next.hasPlate = t("sell_error_hasPlateRequired");
      if (!draft.steering) next.steering = t("sell_error_steeringRequired");
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = t("sell_error_fuelRequired");
      if (!draft.transmission) next.transmission = t("sell_error_transmissionRequired");
      require("color", draft.color);
      require("vin", draft.vin);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "motorcycle") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = t("sell_error_regionRequired");
      if (!draft.hasPlate) next.hasPlate = t("sell_error_hasPlateRequired");
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = t("sell_error_fuelRequired");
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "tire") {
      if (!draft.season) next.season = t("sell_error_seasonRequired");
      require("radius", draft.radius);
      require("width", draft.width);
      require("height", draft.height);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "parts") {
      require("title", draft.title);
      if (!draft.condition) next.condition = t("sell_error_conditionRequired");
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
          <SectionTitle title={t("sell_title")} subtitle={t("sell_common_unsupportedCategory")} />
          <Link href="/sell">
            <Button variant="outline">{t("common_back")}</Button>
          </Link>
        </div>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth returnUrl={`/sell/${params.category}`}>
      <div className="grid gap-6">
        <SectionTitle title={`${t("sell_formTitle")} ${category}`} subtitle={t("sell_formSubtitle")} />

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {draft.category === "car" || draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_manufacturer")}</Label>
                  <Input
                    value={draft.manufacturer}
                    onChange={(e) => setField("manufacturer", e.target.value as any)}
                    placeholder={t("sell_vehicle_manufacturerPlaceholder")}
                  />
                  {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_model")}</Label>
                  <Input
                    value={draft.model}
                    onChange={(e) => setField("model", e.target.value as any)}
                    placeholder={t("sell_vehicle_modelPlaceholder")}
                  />
                  {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_region")}</Label>
                  <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="Ulaanbaatar">{t("sell_vehicle_region_ulaanbaatar")}</option>
                    <option value="Erdenet">{t("sell_vehicle_region_erdenet")}</option>
                    <option value="Darkhan">{t("sell_vehicle_region_darkhan")}</option>
                    <option value="Other">{t("sell_vehicle_region_other")}</option>
                  </Select>
                  {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_hasPlate")}</Label>
                  <Select value={draft.hasPlate} onChange={(e) => setField("hasPlate", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="yes">{t("sell_vehicle_hasPlate_yes")}</option>
                    <option value="no">{t("sell_vehicle_hasPlate_no")}</option>
                  </Select>
                  {errors.hasPlate ? <div className="text-xs text-red-600">{errors.hasPlate}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "car" ? (
              <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_steering")}</Label>
                  <Select value={draft.steering} onChange={(e) => setField("steering", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="left">{t("sell_vehicle_steering_left")}</option>
                    <option value="right">{t("sell_vehicle_steering_right")}</option>
                  </Select>
                  {errors.steering ? <div className="text-xs text-red-600">{errors.steering}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_fuel")}</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="gasoline">{t("sell_vehicle_fuel_gasoline")}</option>
                    <option value="diesel">{t("sell_vehicle_fuel_diesel")}</option>
                    <option value="lpg">{t("sell_vehicle_fuel_lpg")}</option>
                    <option value="electric">{t("sell_vehicle_fuel_electric")}</option>
                    <option value="hybrid">{t("sell_vehicle_fuel_hybrid")}</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_transmission")}</Label>
                  <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                    <option value="">{t("sell_vehicle_transmission_select")}</option>
                    <option value="automatic">{t("sell_vehicle_transmission_automatic")}</option>
                    <option value="manual">{t("sell_vehicle_transmission_manual")}</option>
                  </Select>
                  {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearMade")}</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder={t("sell_vehicle_yearMadePlaceholder")} />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearImported")}</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder={t("sell_vehicle_yearImportedPlaceholder")}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_color")}</Label>
                  <Input value={draft.color} onChange={(e) => setField("color", e.target.value as any)} placeholder={t("sell_vehicle_colorPlaceholder")} />
                  {errors.color ? <div className="text-xs text-red-600">{errors.color}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_vin")}</Label>
                  <Input value={draft.vin} onChange={(e) => setField("vin", e.target.value as any)} placeholder={t("sell_vehicle_vinPlaceholder")} />
                  {errors.vin ? <div className="text-xs text-red-600">{errors.vin}</div> : null}
                </div>
              </div>

                {/* Options */}
                <div className="grid gap-3">
                  <Label>{t("carDetail_options_title")}</Label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { key: "sunroof", label: t("carDetail_options_sunroof") },
                      { key: "sensors", label: t("carDetail_options_sensors") },
                      { key: "smartKey", label: t("carDetail_options_smartKey") },
                      { key: "heatedSeat", label: t("carDetail_options_heatedSeat") },
                      { key: "ventilatedSeat", label: t("carDetail_options_ventilatedSeat") },
                      { key: "leatherSeat", label: t("carDetail_options_leatherSeat") },
                      { key: "heatedSteering", label: t("carDetail_options_heatedSteering") },
                    ].map((opt) => {
                      const options = draft.options || {
                        sunroof: false,
                        sensors: false,
                        smartKey: false,
                        heatedSeat: false,
                        ventilatedSeat: false,
                        leatherSeat: false,
                        heatedSteering: false,
                      };
                      return (
                        <label key={opt.key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 hover:bg-zinc-50">
                          <input
                            type="checkbox"
                            checked={options[opt.key as keyof typeof options] || false}
                            onChange={(e) => {
                              setField("options", {
                                ...options,
                                [opt.key]: e.target.checked,
                              });
                            }}
                            className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                          />
                          <span className="text-sm font-normal text-zinc-700">{opt.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}

            {draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearMade")}</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder={t("sell_motorcycle_yearMadePlaceholder")} />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearImported")}</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder={t("sell_motorcycle_yearImportedPlaceholder")}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_fuel")}</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="gasoline">{t("sell_motorcycle_fuel_gasoline")}</option>
                    <option value="electric">{t("sell_motorcycle_fuel_electric")}</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "tire" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_tire_season")}</Label>
                  <Select value={draft.season} onChange={(e) => setField("season", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="all-season">{t("sell_tire_season_allSeason")}</option>
                    <option value="winter">{t("sell_tire_season_winter")}</option>
                    <option value="summer">{t("sell_tire_season_summer")}</option>
                  </Select>
                  {errors.season ? <div className="text-xs text-red-600">{errors.season}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_radius")}</Label>
                  <Input value={draft.radius} onChange={(e) => setField("radius", e.target.value as any)} placeholder={t("sell_tire_radiusPlaceholder")} />
                  {errors.radius ? <div className="text-xs text-red-600">{errors.radius}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_width")}</Label>
                  <Input value={draft.width} onChange={(e) => setField("width", e.target.value as any)} placeholder={t("sell_tire_widthPlaceholder")} />
                  {errors.width ? <div className="text-xs text-red-600">{errors.width}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_height")}</Label>
                  <Input value={draft.height} onChange={(e) => setField("height", e.target.value as any)} placeholder={t("sell_tire_heightPlaceholder")} />
                  {errors.height ? <div className="text-xs text-red-600">{errors.height}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "parts" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label>{t("sell_parts_title")}</Label>
                  <Input value={draft.title} onChange={(e) => setField("title", e.target.value as any)} placeholder={t("sell_parts_titlePlaceholder")} />
                  {errors.title ? <div className="text-xs text-red-600">{errors.title}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_parts_condition")}</Label>
                  <Select value={draft.condition} onChange={(e) => setField("condition", e.target.value as any)}>
                    <option value="">{t("sell_common_select")}</option>
                    <option value="new">{t("sell_parts_condition_new")}</option>
                    <option value="used">{t("sell_parts_condition_used")}</option>
                  </Select>
                  {errors.condition ? <div className="text-xs text-red-600">{errors.condition}</div> : null}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2 sm:max-w-sm">
              <Label>{t("sell_vehicle_price")}</Label>
              <Input
                value={(draft as any).priceMnt ?? ""}
                onChange={(e) => setField("priceMnt" as any, e.target.value as any)}
                placeholder={t("sell_vehicle_pricePlaceholder")}
              />
              {errors.priceMnt ? <div className="text-xs text-red-600">{errors.priceMnt}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_photos")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>{t("sell_common_imageUpload")}</Label>
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
                        {t("sell_common_delete")}
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>{t("sell_common_videoUpload")}</Label>
              <Input type="file" accept=".mpg,.mp4,.mov" onChange={onPickVideo} />
              {video ? <div className="text-xs text-zinc-600">{t("sell_common_selected")}: {video.name}</div> : null}
              {errors.video ? <div className="text-xs text-red-600">{errors.video}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("sell_common_memo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.memo}
              maxLength={10_000}
              onChange={(e) => setField("memo", e.target.value as any)}
              placeholder={t("sell_common_memoPlaceholder")}
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
            <CardTitle>{t("sell_common_contact")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("sell_contact_name")}</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value as any)}
                placeholder={t("sell_contact_namePlaceholder")}
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_email")}</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value as any)}
                placeholder={t("sell_contact_emailPlaceholder")}
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_phone")}</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value as any)}
                placeholder={t("sell_contact_phonePlaceholder")}
              />
              {errors.contactPhone ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Link href="/sell">
            <Button variant="outline">{t("common_back")}</Button>
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
              {t("sell_common_reset")}
            </Button>
            <Button variant="primary" onClick={onSubmit}>{t("sell_form_continueToPayment")}</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {t("sell_common_draftAutoSave")}: <span className="font-mono">sellDraft:{category}</span>
        </div>
      </div>
    </RequireAuth>
  );
}


