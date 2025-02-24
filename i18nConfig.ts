// ./i18nConfig.ts

export const i18nConfig = {
  locales: ["en", "ja", "fr"] as const,
  defaultLocale: "en", // Dafault locale
};

export type Languages = typeof i18nConfig.locales[number];
