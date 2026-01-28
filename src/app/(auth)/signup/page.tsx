"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export default function SignupPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { signupAndLogin } = useAuth();
  const [returnUrl, setReturnUrl] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [id, setId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const ru = sp.get("returnUrl");
    setReturnUrl(ru);
  }, []);

  const onSubmit = () => {
    setMessage(null);
    if (password !== confirm) return setMessage({ type: "error", text: t("signup_passwordMismatch") });
    const res = signupAndLogin({ name, email, phone, id, password });
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    setMessage({ type: "success", text: t("signup_success") });
    router.push(returnUrl || "/");
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-10">
      <SectionTitle title={t("signup_title")} subtitle={t("signup_subtitle")} />
      <Card>
        <CardHeader>
          <CardTitle>{t("signup_cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {message ? (
            <Alert variant={message.type === "error" ? "destructive" : "success"}>
              <AlertTitle>{message.type === "error" ? t("common_error") : t("common_success")}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          ) : null}

          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("signup_placeholder_name")} />
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("signup_placeholder_email")} />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("signup_placeholder_phone")} />
          <Input value={id} onChange={(e) => setId(e.target.value)} placeholder={t("signup_placeholder_id")} />
          <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("signup_placeholder_password")} type="password" />
          <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t("signup_placeholder_confirm")} type="password" />

          <Button variant="primary" onClick={onSubmit}>{t("signup_createMock")}</Button>
          <div className="text-sm text-zinc-600">
            {t("signup_alreadyHave")}{" "}
            <Link className="font-normal text-zinc-900 hover:underline" href="/login">
              {t("auth_login")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


