// src/app/i18n.ts

import { createInstance, i18n, Resource } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { i18nConfig } from '../../../i18nConfig';

type InitTranslationsParams = {
  locale: string;         // 現在のロケール
  namespaces: string[];   // ロードしたい名前空間
  i18nInstance?: i18n;    // すでに生成済みの i18n インスタンス (クライアント用)
  resources?: Resource;   // 既にサーバーから受け取った翻訳リソース
};

export async function initTranslations({
  locale,
  namespaces,
  i18nInstance,
  resources,
}: InitTranslationsParams) {
  // 既存インスタンスがなければ作成
  const instance = i18nInstance || createInstance();

  // i18next に react-i18next を組み込む
  instance.use(initReactI18next);

  // サーバー側でJSONを動的読み込みするための設定
  if (!resources) {
    instance.use(
      resourcesToBackend((language: string, namespace: string) =>
        import(`@/locales/${language}/${namespace}.json`)
      )
    );
  }

  // i18n初期化
  if (!instance.isInitialized) {
    await instance.init({
      lng: locale,
      resources,
      fallbackLng: i18nConfig.defaultLocale,
      supportedLngs: i18nConfig.locales as unknown as string[],
      defaultNS: namespaces[0],
      fallbackNS: namespaces[0],
      ns: namespaces,
      preload: resources ? [] : i18nConfig.locales, // サーバープリロード
    });
  } else {
    // 既に初期化済みの場合、言語を更新するだけでもOK
    instance.changeLanguage(locale);
  }

  return {
    i18n: instance,
    // 全部の翻訳リソース (クライアントへ渡すときに使う)
    resources: instance.services.resourceStore.data,
    t: instance.t,
  };
}
