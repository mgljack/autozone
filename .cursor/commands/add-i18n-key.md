# Add i18n Key

다국어 번역 키를 추가합니다.

## 파일 위치
`src/i18n/dictionaries.ts`

## 중요
**반드시 3개 언어 모두** 동시에 추가해야 합니다:
- `mn`: 몽골어
- `ko`: 한국어  
- `en`: 영어

## 키 네이밍 규칙
`섹션.서브섹션.키`

예시:
- `home.title`
- `carDetail.specs.price`
- `sell.form.continueToPayment`

## 추가 예시

```typescript
// dictionaries.ts
mn: {
  // 기존 키들...
  "newSection.newKey": "Монгол текст",
},
ko: {
  // 기존 키들...
  "newSection.newKey": "한국어 텍스트",
},
en: {
  // 기존 키들...
  "newSection.newKey": "English text",
},
```

## 사용법

```tsx
const { t } = useI18n();
<span>{t("newSection.newKey")}</span>
```

