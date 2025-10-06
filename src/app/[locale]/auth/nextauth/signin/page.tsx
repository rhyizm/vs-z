"use client";

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLiff } from '@/lib/liff';

export default function NextAuthSignInPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const { login, error, syncingSession, isReady, isLoggedIn } = useLiff();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace(`/${locale}`);
    }
  }, [isLoggedIn, router, locale]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('auth.lineLoginTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('auth.lineLoginDescription')}
          </p>
        </div>
        <div className="mt-8 space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
          {error && (
            <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
          <button
            type="button"
            onClick={login}
            disabled={!isReady || syncingSession}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-[#06c755] px-4 py-3 text-sm font-medium text-white hover:bg-[#05b14c] focus:outline-none focus:ring-2 focus:ring-[#06c755] focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-gray-800"
          >
            {syncingSession ? t('auth.syncing') : t('auth.lineLoginButton')}
          </button>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            {t('auth.lineLoginHint')}
          </p>
        </div>
      </div>
    </div>
  );
}
