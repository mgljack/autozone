"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { useQuery } from "@tanstack/react-query";

import { RequireAuth } from "@/components/common/RequireAuth";
import { SectionTitle } from "@/components/common/SectionTitle";
import { CustomSelect } from "@/components/common/CustomSelect";
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
import { PostCreateSummaryCard } from "@/components/posting/PostCreateSummaryCard";
import { fetchCarTaxonomy } from "@/lib/mockApi";
import { sampleCarImage } from "@/mock/cars";

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
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  // Fetch car taxonomy for manufacturer and model dropdowns
  const taxonomyQuery = useQuery({
    queryKey: ["carTaxonomy"],
    queryFn: () => fetchCarTaxonomy(),
    enabled: draft.category === "car" || draft.category === "motorcycle",
  });

  // Get available models based on selected manufacturer
  const availableModels = React.useMemo(() => {
    if (draft.category !== "car" && draft.category !== "motorcycle") return [];
    const manufacturer = draft.category === "car" || draft.category === "motorcycle" ? draft.manufacturer : "";
    if (!manufacturer || !taxonomyQuery.data) return [];
    return taxonomyQuery.data.modelsByManufacturer[manufacturer] ?? [];
  }, [draft.category, taxonomyQuery.data]);

  // Generate year options (1990 to current year)
  const yearOptions = React.useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: { value: string; label: string }[] = [];
    for (let year = currentYear; year >= 1990; year--) {
      years.push({ value: String(year), label: String(year) });
    }
    return years;
  }, []);

  // Category banner images
  const categoryBannerImage = React.useMemo(() => {
    switch (category) {
      case "car":
        return sampleCarImage(1);
      case "motorcycle":
        return "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&h=600&fit=crop&auto=format";
      case "tire":
        return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop&auto=format";
      case "parts":
        return "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&h=600&fit=crop&auto=format";
      default:
        return sampleCarImage(1);
    }
  }, [category]);

  // Reset model when manufacturer changes
  React.useEffect(() => {
    if (draft.category === "car" || draft.category === "motorcycle") {
      const manufacturer = draft.category === "car" || draft.category === "motorcycle" ? draft.manufacturer : "";
      const currentModels = taxonomyQuery.data?.modelsByManufacturer[manufacturer] ?? [];
      const model = draft.category === "car" || draft.category === "motorcycle" ? draft.model : "";
      if (model && !currentModels.includes(model)) {
        setField("model", "");
      }
    }
  }, [draft.category, taxonomyQuery.data]);

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

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder images and previews
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    const [draggedImage] = newImages.splice(draggedIndex, 1);
    const [draggedPreview] = newPreviews.splice(draggedIndex, 1);
    
    newImages.splice(dropIndex, 0, draggedImage);
    newPreviews.splice(dropIndex, 0, draggedPreview);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
    setDraggedIndex(null);
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
    setIsSubmitting(true);
    
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
      <div className="grid gap-6 pb-24 lg:pb-6">
        {/* Premium Banner Section */}
        <section className="mb-2">
          <div className="relative h-32 overflow-hidden rounded-2xl border border-slate-200/70 sm:h-40">
            <Image
              src={categoryBannerImage}
              alt={t("sell_form_banner_title")}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/40" />
            <div className="relative z-10 flex h-full items-center p-6 sm:p-8">
              <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{t("sell_form_banner_title")}</h1>
                <p className="mt-2 text-sm text-slate-100 sm:text-base">
                  {t("sell_form_banner_subtitle")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* Left: Form Sections */}
      <div className="grid gap-6">
            {/* Basic Info Section */}
            <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <CardHeader>
            <CardTitle>{t("sell_common_basicInfo")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {draft.category === "car" || draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_manufacturer")}</Label>
                  <CustomSelect
                    value={draft.manufacturer || ""}
                    onChange={(v) => setField("manufacturer", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...(taxonomyQuery.data?.manufacturers ?? []).map((m) => ({
                        value: m,
                        label: m,
                      })),
                    ]}
                    placeholder={t("sell_vehicle_manufacturerPlaceholder")}
                  />
                  {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_model")}</Label>
                  <CustomSelect
                    value={draft.model || ""}
                    onChange={(v) => setField("model", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...availableModels.map((m) => ({
                        value: m,
                        label: m,
                      })),
                    ]}
                    placeholder={t("sell_vehicle_modelPlaceholder")}
                    disabled={!draft.manufacturer}
                  />
                  {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_region")}</Label>
                  <CustomSelect
                    value={draft.region || ""}
                    onChange={(v) => setField("region", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "Ulaanbaatar", label: t("sell_vehicle_region_ulaanbaatar") },
                      { value: "Erdenet", label: t("sell_vehicle_region_erdenet") },
                      { value: "Darkhan", label: t("sell_vehicle_region_darkhan") },
                      { value: "Other", label: t("sell_vehicle_region_other") },
                    ]}
                  />
                  {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_hasPlate")}</Label>
                  <CustomSelect
                    value={draft.hasPlate || ""}
                    onChange={(v) => setField("hasPlate", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "yes", label: t("sell_vehicle_hasPlate_yes") },
                      { value: "no", label: t("sell_vehicle_hasPlate_no") },
                    ]}
                  />
                  {errors.hasPlate ? <div className="text-xs text-red-600">{errors.hasPlate}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "car" ? (
              <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_steering")}</Label>
                  <CustomSelect
                    value={draft.steering || ""}
                    onChange={(v) => setField("steering", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "left", label: t("sell_vehicle_steering_left") },
                      { value: "right", label: t("sell_vehicle_steering_right") },
                    ]}
                  />
                  {errors.steering ? <div className="text-xs text-red-600">{errors.steering}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_fuel")}</Label>
                  <CustomSelect
                    value={draft.fuel || ""}
                    onChange={(v) => setField("fuel", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "gasoline", label: t("sell_vehicle_fuel_gasoline") },
                      { value: "diesel", label: t("sell_vehicle_fuel_diesel") },
                      { value: "lpg", label: t("sell_vehicle_fuel_lpg") },
                      { value: "electric", label: t("sell_vehicle_fuel_electric") },
                      { value: "hybrid", label: t("sell_vehicle_fuel_hybrid") },
                    ]}
                  />
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_transmission")}</Label>
                  <CustomSelect
                    value={draft.transmission || ""}
                    onChange={(v) => setField("transmission", v)}
                    options={[
                      { value: "", label: t("sell_vehicle_transmission_select") },
                      { value: "automatic", label: t("sell_vehicle_transmission_automatic") },
                      { value: "manual", label: t("sell_vehicle_transmission_manual") },
                    ]}
                  />
                  {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearMade")}</Label>
                  <CustomSelect
                    value={draft.yearMade || ""}
                    onChange={(v) => setField("yearMade", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...yearOptions,
                    ]}
                  />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearImported")}</Label>
                  <CustomSelect
                    value={draft.yearImported || ""}
                    onChange={(v) => setField("yearImported", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...yearOptions,
                    ]}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_color")}</Label>
                  <CustomSelect
                    value={draft.color || ""}
                    onChange={(v) => setField("color", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "black", label: t("buyAll_option_color_black") },
                      { value: "white", label: t("buyAll_option_color_white") },
                      { value: "silver", label: t("buyAll_option_color_silver") },
                      { value: "pearl", label: t("buyAll_option_color_pearl") },
                      { value: "gray", label: t("buyAll_option_color_gray") },
                      { value: "darkgray", label: t("buyAll_option_color_darkgray") },
                      { value: "green", label: t("buyAll_option_color_green") },
                      { value: "blue", label: t("buyAll_option_color_blue") },
                      { value: "other", label: t("buyAll_option_color_other") },
                    ]}
                  />
                  {errors.color ? <div className="text-xs text-red-600">{errors.color}</div> : null}
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
                  <CustomSelect
                    value={draft.yearMade || ""}
                    onChange={(v) => setField("yearMade", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...yearOptions,
                    ]}
                  />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_yearImported")}</Label>
                  <CustomSelect
                    value={draft.yearImported || ""}
                    onChange={(v) => setField("yearImported", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      ...yearOptions,
                    ]}
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>{t("sell_vehicle_fuel")}</Label>
                  <CustomSelect
                    value={draft.fuel || ""}
                    onChange={(v) => setField("fuel", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "gasoline", label: t("sell_motorcycle_fuel_gasoline") },
                      { value: "electric", label: t("sell_motorcycle_fuel_electric") },
                    ]}
                  />
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "tire" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>{t("sell_tire_season")}</Label>
                  <CustomSelect
                    value={draft.season || ""}
                    onChange={(v) => setField("season", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "all-season", label: t("sell_tire_season_allSeason") },
                      { value: "winter", label: t("sell_tire_season_winter") },
                      { value: "summer", label: t("sell_tire_season_summer") },
                    ]}
                  />
                  {errors.season ? <div className="text-xs text-red-600">{errors.season}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_radius")}</Label>
                  <Input value={draft.radius} onChange={(e) => setField("radius", e.target.value as any)} placeholder={t("sell_tire_radiusPlaceholder")} className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20" />
                  {errors.radius ? <div className="text-xs text-red-600">{errors.radius}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_width")}</Label>
                  <Input value={draft.width} onChange={(e) => setField("width", e.target.value as any)} placeholder={t("sell_tire_widthPlaceholder")} className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20" />
                  {errors.width ? <div className="text-xs text-red-600">{errors.width}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_tire_height")}</Label>
                  <Input value={draft.height} onChange={(e) => setField("height", e.target.value as any)} placeholder={t("sell_tire_heightPlaceholder")} className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20" />
                  {errors.height ? <div className="text-xs text-red-600">{errors.height}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "parts" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label>{t("sell_parts_title")}</Label>
                  <Input value={draft.title} onChange={(e) => setField("title", e.target.value as any)} placeholder={t("sell_parts_titlePlaceholder")} className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20" />
                  {errors.title ? <div className="text-xs text-red-600">{errors.title}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>{t("sell_parts_condition")}</Label>
                  <CustomSelect
                    value={draft.condition || ""}
                    onChange={(v) => setField("condition", v)}
                    options={[
                      { value: "", label: t("sell_common_select") },
                      { value: "new", label: t("sell_parts_condition_new") },
                      { value: "used", label: t("sell_parts_condition_used") },
                    ]}
                  />
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
                className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              />
              {errors.priceMnt ? <div className="text-xs text-red-600">{errors.priceMnt}</div> : null}
            </div>
          </CardContent>
        </Card>

            {/* Photos Section */}
            <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <CardHeader className="px-0 pb-4 pt-0">
                <CardTitle className="text-base font-semibold text-zinc-900">{t("sell_common_photos")}</CardTitle>
          </CardHeader>
              <CardContent className="grid gap-4 px-0">
            <div className="grid gap-2">
              <Label>{t("sell_common_imageUpload")}</Label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 transition-colors hover:border-rose-400 hover:bg-rose-50/30">
                <input
                type="file"
                accept=".jpg,.jpeg,.png,.gif"
                multiple
                onChange={onPickImages}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-rose-100 p-3">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-rose-700">{t("sell_common_imageUpload")}</span>
                    <p className="mt-1 text-xs text-zinc-500">{t("sell_common_imageUploadHint")}</p>
                  </div>
                </div>
              </label>
              {errors.images ? <div className="text-xs text-red-600">{errors.images}</div> : null}
              {imagePreviews.length ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={`${src}-${idx}`}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`relative cursor-move overflow-hidden rounded-xl border border-zinc-200 bg-white transition-all ${
                        draggedIndex === idx ? "opacity-50 scale-95" : "hover:border-zinc-300 hover:shadow-md"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`upload-${idx}`} className="h-20 w-full object-cover pointer-events-none" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageAt(idx);
                        }}
                        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-rose-50 hover:shadow-lg"
                        aria-label={t("sell_common_delete")}
                      >
                        <svg className="h-4 w-4 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>{t("sell_common_videoUpload")}</Label>
              <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 transition-colors hover:border-rose-400 hover:bg-rose-50/30">
                <input
                  type="file"
                  accept=".mpg,.mp4,.mov"
                  onChange={onPickVideo}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-full bg-rose-100 p-3">
                    <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-zinc-700 group-hover:text-rose-700">{t("sell_common_videoUpload")}</span>
                    <p className="mt-1 text-xs text-zinc-500">{t("sell_common_videoUploadHint")}</p>
                  </div>
                </div>
              </label>
              {video ? (
                <div className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <svg className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="flex-1 text-xs text-zinc-600">{video.name}</span>
                  <button
                    type="button"
                    onClick={() => setVideo(null)}
                    className="rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                    aria-label={t("sell_common_delete")}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : null}
              {errors.video ? <div className="text-xs text-red-600">{errors.video}</div> : null}
            </div>
          </CardContent>
        </Card>

            {/* Memo Section */}
            <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <CardHeader className="px-0 pb-4 pt-0">
                <CardTitle className="text-base font-semibold text-zinc-900">{t("sell_common_memo")}</CardTitle>
          </CardHeader>
              <CardContent className="grid gap-2 px-0">
            <Textarea
              value={draft.memo}
              maxLength={10_000}
              onChange={(e) => setField("memo", e.target.value as any)}
              placeholder={t("sell_common_memoPlaceholder")}
              className="rounded-xl focus:ring-2 focus:ring-rose-500/20"
            />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>{errors.memo ? <span className="text-red-600">{errors.memo}</span> : null}</div>
              <div>
                {memoCount.toLocaleString()} / 10,000
              </div>
            </div>
          </CardContent>
        </Card>

            {/* Contact Section */}
            <Card className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <CardHeader className="px-0 pb-4 pt-0">
                <CardTitle className="text-base font-semibold text-zinc-900">{t("sell_common_contact")}</CardTitle>
          </CardHeader>
              <CardContent className="grid gap-4 px-0 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>{t("sell_contact_name")}</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value as any)}
                placeholder={t("sell_contact_namePlaceholder")}
                className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_email")}</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value as any)}
                placeholder={t("sell_contact_emailPlaceholder")}
                className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>{t("sell_contact_phone")}</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value as any)}
                placeholder={t("sell_contact_phonePlaceholder")}
                className="h-11 rounded-xl focus:ring-2 focus:ring-rose-500/20"
              />
              {errors.contactPhone ? <div className="text-xs text-red-600">{errors.contactPhone}</div> : null}
            </div>
          </CardContent>
        </Card>

            {/* Actions */}
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
                <Button variant="primary" onClick={onSubmit} disabled={isSubmitting} className="lg:hidden">
                  {isSubmitting ? t("common_loading") : t("sell_form_continueToPayment")}
                </Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          {t("sell_common_draftAutoSave")}: <span className="font-mono">sellDraft:{category}</span>
            </div>
          </div>

          {/* Right: Summary Card (Desktop) */}
          <aside className="hidden lg:block">
            <PostCreateSummaryCard
              draft={draft}
              imagesCount={images.length}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </aside>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white p-4 shadow-lg lg:hidden">
          <Button variant="primary" className="w-full" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("common_loading") : t("sell_form_continueToPayment")}
          </Button>
        </div>
      </div>
    </RequireAuth>
  );
}


