"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { SectionTitle } from "@/components/common/SectionTitle";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithIdPw, sendPhoneCode, loginWithPhoneOtp, loginWithSocial } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = React.useState<"idpw" | "phone">("idpw");

  const [id, setId] = React.useState("demo");
  const [pw, setPw] = React.useState("demo1234");

  const [phone, setPhone] = React.useState("");
  const [codeSent, setCodeSent] = React.useState(false);
  const [otp, setOtp] = React.useState("");

  const [message, setMessage] = React.useState<{ type: "error" | "success"; text: string } | null>(null);
  const [returnUrl, setReturnUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const ru = sp.get("returnUrl");
    setReturnUrl(ru);
  }, []);

  const onIdPwLogin = () => {
    setMessage(null);
    const res = loginWithIdPw(id, pw);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    router.push(returnUrl || "/");
  };

  const onSendCode = () => {
    setMessage(null);
    const res = sendPhoneCode(phone);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    setCodeSent(true);
    setMessage({ type: "success", text: t("login.otpHint") });
  };

  const onPhoneLogin = () => {
    setMessage(null);
    const res = loginWithPhoneOtp(phone, otp);
    if (!res.ok) return setMessage({ type: "error", text: res.error });
    router.push(returnUrl || "/");
  };

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 px-4 py-10">
      <SectionTitle title={t("login.title")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("login.cardTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          {message ? (
            <Alert variant={message.type === "error" ? "destructive" : "success"}>
              <AlertTitle>{message.type === "error" ? t("common.error") : t("common.success")}</AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          ) : null}

          <Tabs value={tab} onValueChange={(v) => setTab(v as "idpw" | "phone")}>
            <TabsList>
              <TabsTrigger value="idpw">{t("login.tab.idpw")}</TabsTrigger>
              <TabsTrigger value="phone">{t("login.tab.phone")}</TabsTrigger>
            </TabsList>

            <TabsContent value="idpw" className="grid gap-3">
              <Input value={id} onChange={(e) => setId(e.target.value)} placeholder={t("login.placeholder.id")} />
              <Input value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("login.placeholder.password")} type="password" />
              <Button onClick={onIdPwLogin}>{t("auth.login")}</Button>
            </TabsContent>

            <TabsContent value="phone" className="grid gap-3">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("login.placeholder.phone")} />
              {!codeSent ? (
                <Button variant="secondary" onClick={onSendCode}>
                  {t("login.sendOtp")}
                </Button>
              ) : (
                <>
                  <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder={t("login.placeholder.otp")} />
                  <Button onClick={onPhoneLogin}>{t("login.verifyAndLogin")}</Button>
                </>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid gap-2">
            <div className="text-xs font-normal text-zinc-600">{t("login.socialTitle")}</div>
            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => (loginWithSocial("google"), router.push(returnUrl || "/"))}>
                Google
              </Button>
              <Button variant="outline" onClick={() => (loginWithSocial("facebook"), router.push(returnUrl || "/"))}>
                Facebook
              </Button>
              <Button variant="outline" onClick={() => (loginWithSocial("apple"), router.push(returnUrl || "/"))}>
                Apple
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-zinc-700">
            <Link className="hover:underline" href={returnUrl ? `/signup?returnUrl=${encodeURIComponent(returnUrl)}` : "/signup"}>
              {t("login.links.signup")}
            </Link>
            <Link className="hover:underline" href="/find-id">
              {t("login.links.findId")}
            </Link>
            <Link className="hover:underline" href="/find-password">
              {t("login.links.findPassword")}
            </Link>
          </div>

          <div className="text-sm">
            <Link className="font-normal text-zinc-900 hover:underline" href="/">
              ← {t("common.backToHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


