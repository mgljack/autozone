/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * i18n Migration Script
 * 
 * This script converts the i18n system from:
 * - Dot notation keys ("app.name") to underscore notation ("app_name")
 * - TypeScript dictionaries to separate JSON files per locale
 * - Updates all frontend files that use t() function
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const DICTIONARIES_PATH = path.join(PROJECT_ROOT, 'src/i18n/dictionaries.ts');
const LOCALES_DIR = path.join(PROJECT_ROOT, 'locales');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

// Convert dot notation to underscore notation
function convertKey(key) {
  return key.replace(/\./g, '_');
}

// Parse dictionaries.ts and extract translations
function parseDictionaries() {
  const content = fs.readFileSync(DICTIONARIES_PATH, 'utf-8');
  
  const locales = {};
  const localeNames = ['mn', 'ko', 'en'];
  
  for (const locale of localeNames) {
    locales[locale] = {};
    
    // Find the locale object in the file
    const localeRegex = new RegExp(`\\b${locale}:\\s*\\{([\\s\\S]*?)\\n\\s*\\}(?=,?\\s*(?:${localeNames.join('|')}:|\\};))`, 'g');
    const match = content.match(localeRegex);
    
    if (match) {
      const localeContent = match[0];
      
      // Extract key-value pairs
      const kvRegex = /"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/g;
      let kvMatch;
      
      while ((kvMatch = kvRegex.exec(localeContent)) !== null) {
        const oldKey = kvMatch[1];
        const value = kvMatch[2];
        const newKey = convertKey(oldKey);
        locales[locale][newKey] = value;
      }
    }
  }
  
  return locales;
}

// Create locales directory and JSON files
function createLocaleFiles(locales) {
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
    console.log('✓ Created locales/ directory');
  }
  
  for (const [locale, translations] of Object.entries(locales)) {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    const content = JSON.stringify(translations, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Created locales/${locale}.json (${Object.keys(translations).length} keys)`);
  }
}

// Get all TypeScript/TSX files in src directory
function getAllSourceFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllSourceFiles(fullPath, files);
    } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Update t() calls in a file
function updateTCallsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Match t("key.with.dots") or t('key.with.dots') or t(`key.with.dots`)
  const patterns = [
    /t\("([^"]+)"\)/g,
    /t\('([^']+)'\)/g,
    /t\(`([^`]+)`\)/g,
  ];
  
  for (const pattern of patterns) {
    content = content.replace(pattern, (match, key) => {
      if (key.includes('.')) {
        const newKey = convertKey(key);
        modified = true;
        // Preserve the quote style
        const quote = match[2];
        return `t(${quote}${newKey}${quote})`;
      }
      return match;
    });
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  }
  
  return false;
}

// Update I18nContext.tsx to use JSON files
function updateI18nContext() {
  const contextPath = path.join(SRC_DIR, 'context/I18nContext.tsx');
  
  const newContent = `"use client";

import React from "react";

import { readLocalStorage, writeLocalStorage } from "@/lib/storage";

// Import locale JSON files
import mnLocale from "../../locales/mn.json";
import koLocale from "../../locales/ko.json";
import enLocale from "../../locales/en.json";

export type Locale = "mn" | "ko" | "en";

type Dictionaries = Record<Locale, Record<string, string>>;

const dictionaries: Dictionaries = {
  mn: mnLocale,
  ko: koLocale,
  en: enLocale,
};

type I18nContextValue = {
  // Preferred names (per spec)
  lang: Locale;
  setLang: (next: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;

  // Backwards-compatible aliases (do not remove without updating all callsites)
  locale: Locale;
  setLocale: (next: Locale) => void;
};

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Locale>(() =>
    readLocalStorage<Locale>("lang", "mn"),
  );

  const setLang = React.useCallback((next: Locale) => {
    setLangState(next);
    writeLocalStorage("lang", next);
  }, []);

  const t = React.useCallback((key: string, vars?: Record<string, string | number>) => {
    const template = dictionaries[lang]?.[key] ?? dictionaries.mn?.[key] ?? key;
    if (!vars) return template;
    return template.replace(/\\{(\\w+)\\}/g, (_m, name: string) => String(vars[name] ?? \`{\${name}}\`));
  }, [lang]);

  const value = React.useMemo(
    () => ({
      lang,
      setLang,
      t,
      locale: lang,
      setLocale: setLang,
    }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
`;

  fs.writeFileSync(contextPath, newContent, 'utf-8');
  console.log('✓ Updated src/context/I18nContext.tsx');
}

// Main migration function
function migrate() {
  console.log('=== i18n Migration Script ===\n');
  
  // Step 1: Parse dictionaries
  console.log('Step 1: Parsing dictionaries.ts...');
  const locales = parseDictionaries();
  console.log(`  Found ${Object.keys(locales).length} locales\n`);
  
  // Step 2: Create locale JSON files
  console.log('Step 2: Creating locale JSON files...');
  createLocaleFiles(locales);
  console.log('');
  
  // Step 3: Update all source files
  console.log('Step 3: Updating t() calls in source files...');
  const sourceFiles = getAllSourceFiles(SRC_DIR);
  let updatedCount = 0;
  
  for (const file of sourceFiles) {
    if (updateTCallsInFile(file)) {
      const relativePath = path.relative(PROJECT_ROOT, file);
      console.log(`  ✓ Updated: ${relativePath}`);
      updatedCount++;
    }
  }
  console.log(`  Total files updated: ${updatedCount}\n`);
  
  // Step 4: Update I18nContext.tsx
  console.log('Step 4: Updating I18nContext.tsx...');
  updateI18nContext();
  console.log('');
  
  // Step 5: Delete old dictionaries.ts (optional - commented out for safety)
  // console.log('Step 5: Removing old dictionaries.ts...');
  // fs.unlinkSync(DICTIONARIES_PATH);
  // console.log('✓ Deleted src/i18n/dictionaries.ts\n');
  
  console.log('=== Migration Complete ===');
  console.log('\nNext steps:');
  console.log('1. Review the changes');
  console.log('2. Run: npm run build (to verify)');
  console.log('3. Delete src/i18n/dictionaries.ts manually if everything works');
}

// Run migration
migrate();

