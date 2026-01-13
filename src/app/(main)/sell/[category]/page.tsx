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
      return setVideoError("동영상은 .mpg, .mp4, .mov만 업로드할 수 있어요.");
    }
    const max = 500 * 1024 * 1024;
    if (file.size > max) {
      setVideo(null);
      return setVideoError("동영상은 최대 500MB까지 업로드할 수 있어요.");
    }
    setVideo(file);
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = "이미지는 최소 1장 업로드해 주세요. (최대 20장)";
    if (draft.memo.trim().length < 1) next.memo = "메모를 입력해 주세요.";
    if (draft.memo.length > 10_000) next.memo = "메모는 최대 10,000자까지 입력할 수 있어요.";
    if (!draft.contactName.trim()) next.contactName = "이름을 입력해 주세요.";
    if (!draft.contactEmail.trim()) next.contactEmail = "이메일을 입력해 주세요.";
    if (!draft.contactPhone.trim()) next.contactPhone = "휴대폰 번호를 입력해 주세요.";

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = "필수 입력 항목입니다.";
    };

    if (draft.category === "car") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = "지역을 선택해 주세요.";
      if (!draft.hasPlate) next.hasPlate = "번호판 유무를 선택해 주세요.";
      if (!draft.steering) next.steering = "핸들 방향을 선택해 주세요.";
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = "연료를 선택해 주세요.";
      if (!draft.transmission) next.transmission = "변속기를 선택해 주세요.";
      require("color", draft.color);
      require("vin", draft.vin);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "motorcycle") {
      require("manufacturer", draft.manufacturer);
      require("model", draft.model);
      if (!draft.region) next.region = "지역을 선택해 주세요.";
      if (!draft.hasPlate) next.hasPlate = "번호판 유무를 선택해 주세요.";
      require("yearMade", draft.yearMade);
      require("yearImported", draft.yearImported);
      if (!draft.fuel) next.fuel = "연료를 선택해 주세요.";
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "tire") {
      if (!draft.season) next.season = "시즌을 선택해 주세요.";
      require("radius", draft.radius);
      require("width", draft.width);
      require("height", draft.height);
      require("priceMnt", draft.priceMnt);
    }

    if (draft.category === "parts") {
      require("title", draft.title);
      if (!draft.condition) next.condition = "상태를 선택해 주세요.";
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
          <SectionTitle title={t("sell.title")} subtitle="지원하지 않는 카테고리입니다." />
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
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {draft.category === "car" || draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>제조사</Label>
                  <Input
                    value={draft.manufacturer}
                    onChange={(e) => setField("manufacturer", e.target.value as any)}
                    placeholder="예) Toyota"
                  />
                  {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>모델</Label>
                  <Input
                    value={draft.model}
                    onChange={(e) => setField("model", e.target.value as any)}
                    placeholder="예) Prius"
                  />
                  {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>지역</Label>
                  <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="Ulaanbaatar">Ulaanbaatar</option>
                    <option value="Erdenet">Erdenet</option>
                    <option value="Darkhan">Darkhan</option>
                    <option value="Other">Other</option>
                  </Select>
                  {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>번호판 유무</Label>
                  <Select value={draft.hasPlate} onChange={(e) => setField("hasPlate", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="yes">있음</option>
                    <option value="no">없음</option>
                  </Select>
                  {errors.hasPlate ? <div className="text-xs text-red-600">{errors.hasPlate}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "car" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>핸들</Label>
                  <Select value={draft.steering} onChange={(e) => setField("steering", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="left">좌핸들</option>
                    <option value="right">우핸들</option>
                  </Select>
                  {errors.steering ? <div className="text-xs text-red-600">{errors.steering}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>연료</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="gasoline">gasoline</option>
                    <option value="diesel">diesel</option>
                    <option value="lpg">LPG</option>
                    <option value="electric">electric</option>
                    <option value="hybrid">hybrid</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>변속기</Label>
                  <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                    <option value="">변속기 선택</option>
                    <option value="automatic">자동</option>
                    <option value="manual">수동</option>
                  </Select>
                  {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>제조연식</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder="예) 2018" />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>수입연식</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder="예) 2019"
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>색상</Label>
                  <Input value={draft.color} onChange={(e) => setField("color", e.target.value as any)} placeholder="예) white" />
                  {errors.color ? <div className="text-xs text-red-600">{errors.color}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>VIN</Label>
                  <Input value={draft.vin} onChange={(e) => setField("vin", e.target.value as any)} placeholder="예) JTDB..." />
                  {errors.vin ? <div className="text-xs text-red-600">{errors.vin}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "motorcycle" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>제조연식</Label>
                  <Input value={draft.yearMade} onChange={(e) => setField("yearMade", e.target.value as any)} placeholder="예) 2020" />
                  {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>수입연식</Label>
                  <Input
                    value={draft.yearImported}
                    onChange={(e) => setField("yearImported", e.target.value as any)}
                    placeholder="예) 2021"
                  />
                  {errors.yearImported ? <div className="text-xs text-red-600">{errors.yearImported}</div> : null}
                </div>

                <div className="grid gap-2">
                  <Label>연료</Label>
                  <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="gasoline">gasoline</option>
                    <option value="electric">electric</option>
                  </Select>
                  {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "tire" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>시즌</Label>
                  <Select value={draft.season} onChange={(e) => setField("season", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="all-season">all-season</option>
                    <option value="winter">winter</option>
                    <option value="summer">summer</option>
                  </Select>
                  {errors.season ? <div className="text-xs text-red-600">{errors.season}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>반경 (radius)</Label>
                  <Input value={draft.radius} onChange={(e) => setField("radius", e.target.value as any)} placeholder="예) 17" />
                  {errors.radius ? <div className="text-xs text-red-600">{errors.radius}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>폭 (width)</Label>
                  <Input value={draft.width} onChange={(e) => setField("width", e.target.value as any)} placeholder="예) 225" />
                  {errors.width ? <div className="text-xs text-red-600">{errors.width}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>편평비 (height)</Label>
                  <Input value={draft.height} onChange={(e) => setField("height", e.target.value as any)} placeholder="예) 55" />
                  {errors.height ? <div className="text-xs text-red-600">{errors.height}</div> : null}
                </div>
              </div>
            ) : null}

            {draft.category === "parts" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2 sm:col-span-2">
                  <Label>제목</Label>
                  <Input value={draft.title} onChange={(e) => setField("title", e.target.value as any)} placeholder="부품 제목" />
                  {errors.title ? <div className="text-xs text-red-600">{errors.title}</div> : null}
                </div>
                <div className="grid gap-2">
                  <Label>상태</Label>
                  <Select value={draft.condition} onChange={(e) => setField("condition", e.target.value as any)}>
                    <option value="">선택</option>
                    <option value="new">new</option>
                    <option value="used">used</option>
                  </Select>
                  {errors.condition ? <div className="text-xs text-red-600">{errors.condition}</div> : null}
                </div>
              </div>
            ) : null}

            <div className="grid gap-2 sm:max-w-sm">
              <Label>가격 (MNT)</Label>
              <Input
                value={(draft as any).priceMnt ?? ""}
                onChange={(e) => setField("priceMnt" as any, e.target.value as any)}
                placeholder="예) 12,000,000"
              />
              {errors.priceMnt ? <div className="text-xs text-red-600">{errors.priceMnt}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>사진/동영상</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>이미지 업로드 (최대 20장)</Label>
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
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label>동영상 업로드 (선택, 최대 500MB)</Label>
              <Input type="file" accept=".mpg,.mp4,.mov" onChange={onPickVideo} />
              {video ? <div className="text-xs text-zinc-600">선택됨: {video.name}</div> : null}
              {errors.video ? <div className="text-xs text-red-600">{errors.video}</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>메모</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.memo}
              maxLength={10_000}
              onChange={(e) => setField("memo", e.target.value as any)}
              placeholder="판매 메모를 입력하세요 (최대 10,000자)"
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
            <CardTitle>연락처</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label>이름</Label>
              <Input
                value={draft.contactName}
                onChange={(e) => setField("contactName", e.target.value as any)}
                placeholder="이름"
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>이메일</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value as any)}
                placeholder="이메일"
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>휴대폰</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value as any)}
                placeholder="휴대폰 번호"
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
              초기화
            </Button>
            <Button onClick={onSubmit}>{t("sell.form.continueToPayment")}</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          Draft는 자동 저장됩니다: <span className="font-mono">sellDraft:{category}</span>
        </div>
      </div>
    </RequireAuth>
  );
}


