# Add Component

새로운 React 컴포넌트를 생성합니다.

## 사용법
컴포넌트 이름과 위치를 지정하세요.

## 템플릿

```tsx
"use client";

import React from "react";

interface ${ComponentName}Props {
  // props 정의
}

export function ${ComponentName}({ }: ${ComponentName}Props) {
  return (
    <div>
      {/* 컴포넌트 내용 */}
    </div>
  );
}
```

## 위치
- UI 컴포넌트: `src/components/ui/`
- 도메인 컴포넌트: `src/components/{domain}/`
- 레이아웃: `src/components/layout/`

