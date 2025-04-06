// components/TranslationsProvider.tsx
'use client';

import { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initTranslations } from '@/components/i18n';
import { createInstance, i18n, Resource } from 'i18next';

interface TranslationsProviderProps {
  children: ReactNode;
  locale: string;
  namespaces: string[];
  resources: Resource;
}

export default function TranslationsProvider({
  children,
  locale,
  namespaces,
  resources,
}: TranslationsProviderProps) {
  // クライアント側で新たに i18n インスタンスを作成
  const i18nClient: i18n = createInstance();

  // initTranslations を呼んでクライアントでも初期化
  // (サーバーから受け取った resources を使うことで無駄なリソース取得を回避)
  initTranslations({
    locale,
    namespaces,
    i18nInstance: i18nClient,
    resources,
  });

  return <I18nextProvider i18n={i18nClient}>{children}</I18nextProvider>;
}
