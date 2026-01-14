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

type RentDraft = {
  rentType: "small" | "large" | "truck" | "";
  manufacturer: string;
  model: string;
  yearMade: string;
  mileageKm: string;
  fuel: "gasoline" | "diesel" | "electric" | "hybrid" | "";
  transmission: "at" | "mt" | "";
  region: "Ulaanbaatar" | "Erdenet" | "Darkhan" | "Other" | "";
  pricePerDayMnt: string;
  availabilityDate: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

export default function RentRegistrationPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { session } = useAuth();

  const [draft, setDraft] = React.useState<RentDraft>(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("rentDraft") : null;
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // ignore
      }
    }
    return {
      rentType: "",
      manufacturer: "",
      model: "",
      yearMade: "",
      mileageKm: "",
      fuel: "",
      transmission: "",
      region: "",
      pricePerDayMnt: "",
      availabilityDate: "",
      description: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
    };
  });

  const [memoCount, setMemoCount] = React.useState(draft.description.length);
  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
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
    if (typeof window !== "undefined") {
      localStorage.setItem("rentDraft", JSON.stringify(draft));
    }
  }, [draft]);

  React.useEffect(() => {
    setMemoCount(draft.description.length);
  }, [draft.description]);

  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setField = (key: keyof RentDraft, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
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

  const validate = () => {
    const next: Record<string, string> = {};

    if (images.length < 1) next.images = "이미지는 최소 1장 업로드해 주세요. (최대 20장)";
    if (draft.description.trim().length < 1) next.description = "설명을 입력해 주세요.";
    if (draft.description.length > 10_000) next.description = "설명은 최대 10,000자까지 입력할 수 있어요.";
    if (!draft.contactName.trim()) next.contactName = "이름을 입력해 주세요.";
    if (!draft.contactEmail.trim()) next.contactEmail = "이메일을 입력해 주세요.";
    if (!draft.contactPhone.trim()) next.contactPhone = "휴대폰 번호를 입력해 주세요.";

    const require = (key: string, value: string) => {
      if (!value.trim()) next[key] = "필수 입력 항목입니다.";
    };

    if (!draft.rentType) next.rentType = "차량 타입을 선택해 주세요.";
    require("manufacturer", draft.manufacturer);
    require("model", draft.model);
    require("yearMade", draft.yearMade);
    require("mileageKm", draft.mileageKm);
    if (!draft.fuel) next.fuel = "연료를 선택해 주세요.";
    if (!draft.transmission) next.transmission = "변속기를 선택해 주세요.";
    if (!draft.region) next.region = "지역을 선택해 주세요.";
    require("pricePerDayMnt", draft.pricePerDayMnt);
    require("availabilityDate", draft.availabilityDate);

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    
    // TODO: Save rent listing to backend/localStorage
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `rent_${Date.now()}`;
    
    // Save to localStorage for now
    const rentListings = JSON.parse(localStorage.getItem("rentListings") || "[]");
    rentListings.push({
      id,
      ...draft,
      images: images.map((f) => f.name),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("rentListings", JSON.stringify(rentListings));

    alert("렌탈 등록이 완료되었습니다!");
    router.push("/rent/small");
  };

  return (
    <RequireAuth returnUrl="/sell/rent">
      <div className="grid gap-6">
        <SectionTitle title="차량 렌탈 등록" subtitle="렌탈할 차량 정보를 입력해 주세요" />

        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>차량 타입</Label>
                <Select value={draft.rentType} onChange={(e) => setField("rentType", e.target.value as any)}>
                  <option value="">선택</option>
                  <option value="small">소형차</option>
                  <option value="large">대형차</option>
                  <option value="truck">화물차</option>
                </Select>
                {errors.rentType ? <div className="text-xs text-red-600">{errors.rentType}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>제조사</Label>
                <Input
                  value={draft.manufacturer}
                  onChange={(e) => setField("manufacturer", e.target.value)}
                  placeholder="예) Toyota"
                />
                {errors.manufacturer ? <div className="text-xs text-red-600">{errors.manufacturer}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>모델</Label>
                <Input
                  value={draft.model}
                  onChange={(e) => setField("model", e.target.value)}
                  placeholder="예) Prius"
                />
                {errors.model ? <div className="text-xs text-red-600">{errors.model}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>제조년도</Label>
                <Input
                  value={draft.yearMade}
                  onChange={(e) => setField("yearMade", e.target.value)}
                  placeholder="예) 2018"
                />
                {errors.yearMade ? <div className="text-xs text-red-600">{errors.yearMade}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>주행거리 (km)</Label>
                <Input
                  value={draft.mileageKm}
                  onChange={(e) => setField("mileageKm", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="예) 50000"
                  inputMode="numeric"
                />
                {errors.mileageKm ? <div className="text-xs text-red-600">{errors.mileageKm}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>연료</Label>
                <Select value={draft.fuel} onChange={(e) => setField("fuel", e.target.value as any)}>
                  <option value="">선택</option>
                  <option value="gasoline">가솔린</option>
                  <option value="diesel">디젤</option>
                  <option value="electric">전기</option>
                  <option value="hybrid">하이브리드</option>
                </Select>
                {errors.fuel ? <div className="text-xs text-red-600">{errors.fuel}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>변속기</Label>
                <Select value={draft.transmission} onChange={(e) => setField("transmission", e.target.value as any)}>
                  <option value="">선택</option>
                  <option value="at">자동</option>
                  <option value="mt">수동</option>
                </Select>
                {errors.transmission ? <div className="text-xs text-red-600">{errors.transmission}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>지역</Label>
                <Select value={draft.region} onChange={(e) => setField("region", e.target.value as any)}>
                  <option value="">선택</option>
                  <option value="Ulaanbaatar">울란바토르</option>
                  <option value="Erdenet">에르데네트</option>
                  <option value="Darkhan">다르항</option>
                  <option value="Other">기타</option>
                </Select>
                {errors.region ? <div className="text-xs text-red-600">{errors.region}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>일일 렌트 가격 (MNT)</Label>
                <Input
                  value={draft.pricePerDayMnt}
                  onChange={(e) => setField("pricePerDayMnt", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="예) 50000"
                  inputMode="numeric"
                />
                {errors.pricePerDayMnt ? <div className="text-xs text-red-600">{errors.pricePerDayMnt}</div> : null}
              </div>

              <div className="grid gap-2">
                <Label>이용 가능 날짜</Label>
                <Input
                  type="date"
                  value={draft.availabilityDate}
                  onChange={(e) => setField("availabilityDate", e.target.value)}
                />
                {errors.availabilityDate ? <div className="text-xs text-red-600">{errors.availabilityDate}</div> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>사진</CardTitle>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>설명</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Textarea
              value={draft.description}
              maxLength={10_000}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="차량에 대한 설명을 입력하세요 (최대 10,000자)"
            />
            <div className="flex items-center justify-between text-xs text-zinc-600">
              <div>{errors.description ? <span className="text-red-600">{errors.description}</span> : null}</div>
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
                onChange={(e) => setField("contactName", e.target.value)}
                placeholder="이름"
              />
              {errors.contactName ? <div className="text-xs text-red-600">{errors.contactName}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>이메일</Label>
              <Input
                value={draft.contactEmail}
                onChange={(e) => setField("contactEmail", e.target.value)}
                placeholder="이메일"
              />
              {errors.contactEmail ? <div className="text-xs text-red-600">{errors.contactEmail}</div> : null}
            </div>
            <div className="grid gap-2">
              <Label>휴대폰</Label>
              <Input
                value={draft.contactPhone}
                onChange={(e) => setField("contactPhone", e.target.value)}
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
                const defaultDraft: RentDraft = {
                  rentType: "",
                  manufacturer: "",
                  model: "",
                  yearMade: "",
                  mileageKm: "",
                  fuel: "",
                  transmission: "",
                  region: "",
                  pricePerDayMnt: "",
                  availabilityDate: "",
                  description: "",
                  contactName: "",
                  contactEmail: "",
                  contactPhone: "",
                };
                setDraft(defaultDraft);
                setImages([]);
                imagePreviews.forEach((u) => URL.revokeObjectURL(u));
                setImagePreviews([]);
                setErrors({});
              }}
            >
              초기화
            </Button>
            <Button variant="primary" onClick={onSubmit}>등록하기</Button>
          </div>
        </div>

        <div className="text-xs text-zinc-500">
          Draft는 자동 저장됩니다: <span className="font-mono">rentDraft</span>
        </div>
      </div>
    </RequireAuth>
  );
}

