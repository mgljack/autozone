# Add Page

새로운 Next.js App Router 페이지를 생성합니다.

## 구조

```
src/app/(main)/{path}/
├── page.tsx        # 서버 컴포넌트 (메타데이터)
└── pageClient.tsx  # 클라이언트 컴포넌트 (인터랙션)
```

## 서버 페이지 템플릿 (page.tsx)

```tsx
import { Metadata } from "next";
import PageClient from "./pageClient";

export const metadata: Metadata = {
  title: "페이지 제목 | AutoZone.mn",
  description: "페이지 설명",
};

export default function Page() {
  return <PageClient />;
}
```

## 클라이언트 페이지 템플릿 (pageClient.tsx)

```tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/context/I18nContext";

export default function PageClient() {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8">
      <h1 className="text-2xl font-bold">{t("page.title")}</h1>
      {/* 페이지 내용 */}
    </div>
  );
}
```

