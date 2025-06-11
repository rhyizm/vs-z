import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

// i18n 設定
const locales = ['en', 'ja', 'fr'] as const;
const defaultLocale = 'en';

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // 必要なときだけ /en プレフィックスを付与
});

export async function middleware(request: NextRequest) {
  // next-intl でルーティング／リダイレクトを決定
  return handleI18nRouting(request);
}

// matcher は next-intl の推奨パターン＋必要なら追加ルート
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};