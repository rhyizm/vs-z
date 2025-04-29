// ./src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import { i18nConfig } from '../i18nConfig';
import { updateSession } from './lib/supabase/middleware';

// ./src/middleware.ts
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const supabaseResponse = await updateSession(request);

  /* ① まず「リダイレクト or リライト」の応答はそのまま返す */
  if (
    supabaseResponse.headers.get("location") ||               // ← これ
    supabaseResponse.headers.get("x-middleware-rewrite")      // ← または rewrite
  ) {
    return supabaseResponse;
  }

  /* ② 次に「Set-Cookie だけ」なら、一度ブラウザに返して再リクエストさせる */
  if (supabaseResponse.headers.has("set-cookie")) {
    return supabaseResponse;
  }

  /* ③ ここまで来て初めて i18nRouter を通す */
  const i18nResponse = i18nRouter(request, i18nConfig);

  /* ④ クッキーなど上書き危険の少ないヘッダーだけマージ */
  supabaseResponse.headers.forEach((value, key) => {
    if (!["x-middleware-rewrite", "location"].includes(key)) {
      i18nResponse.headers.set(key, value);
    }
  });

  return i18nResponse;
}


// Specify the paths this middleware applies to
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
