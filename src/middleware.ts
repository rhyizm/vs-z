import { type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { updateSession } from '@/lib/supabase/middleware';

// i18n 設定
const locales = ['en', 'ja', 'fr'] as const;
const defaultLocale = 'en';

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // 必要なときだけ /en プレフィックスを付与
});

export async function middleware(request: NextRequest) {
  // 1) next-intl でルーティング／リダイレクトを決定
  const response = handleI18nRouting(request);

  // 2) Supabase に NextResponse を渡して Cookie を確定
  const finalResponse = await updateSession(request, response);

  return finalResponse;
}

// matcher は next-intl の推奨パターン＋必要なら追加ルート
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
