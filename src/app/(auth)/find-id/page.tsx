"use client";

import Link from "next/link";
import React from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/context/I18nContext";

export default function FindIdPage() {
  const { t } = useI18n();
  const [value, setValue] = React.useState("");
  const [result, setResult] = React.useState<string | null>(null);

  const onSubmit = () => {
    // Prototype: no real lookup
    setResult(t("findId_resultMock"));
  };
  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-10">
      <SectionTitle title={t("findId_title")} subtitle={t("findId_subtitle")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("findId_cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {result ? (
            <Alert>
              <AlertTitle>{t("findId_resultTitle")}</AlertTitle>
              <AlertDescription>{result}</AlertDescription>
            </Alert>
          ) : null}
          <Input value={value} onChange={(e) => setValue(e.target.value)} placeholder={t("findId_placeholder")} />
          <Button onClick={onSubmit}>{t("findId_sendMock")}</Button>
          <Link className="text-sm font-normal text-zinc-900 hover:underline" href="/login">
            ← {t("common_back")} • {t("auth_login")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


