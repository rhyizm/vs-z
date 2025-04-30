// ./src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

// ❶ 保護したいルートをまとめて宣言（必要に応じて追加）
const PROTECTED_ROUTES = ["settings", "protected"];

export const updateSession = async (request: NextRequest) => {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  /* ------------------------------------------------------------------ */
  /*  Supabase クライアント                                              */
  /* ------------------------------------------------------------------ */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            // ― 同一リクエスト内で Server Components も読めるように
            request.cookies.set(name, value);
            // ― ブラウザへ送り返す
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  /* ------------------------------------------------------------------ */
  /*  認証チェック                                                       */
  /* ------------------------------------------------------------------ */
  const {
    data: { user },
  } = await supabase.auth.getUser();                           // 推奨 API :contentReference[oaicite:1]{index=1}

  const pathname  = request.nextUrl.pathname;
  const sanitizedPath = pathname.replace(
    /^\/[a-z]{2}(?:-[A-Z]{2})?(?=\/)/,
    ""
  );

  // PROTECTED_ROUTES はスラッグのみ（先頭 / 無し）
  const needsAuth = PROTECTED_ROUTES.some((slug) =>
    sanitizedPath.startsWith(`/${slug}`)
  );

  if (needsAuth && !user) {                                   // ← `!user` で未ログイン判定
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return response;
};
