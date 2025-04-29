/**
 * Supabase OAuth Callback (Server Route)
 *
 * - URL 例: /api/auth/supabase/callback?code=abcd1234&next=/dashboard
 * - 役割 : PKCE コードをアクセストークンに交換し、Cookie をブラウザに付与
 *
 * NOTE:
 *   - Next.js App Router では `route.ts` が自動で Edge/Node ランタイムになります。
 *   - `@supabase/ssr` の createServerClient() を使い、Cookie 操作を委譲します。
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient  } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // ------ 1. クエリ取得 --------------------------------------------------
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/' // 指定がなければホームへ

  // ------ 2. Supabase クライアント生成（SSR） -----------------------------
  // cookies() は NextRequest から取得、setCookie も自動で行う
  const supabase = await createClient()

  // ------ 3. コード → セッション交換 -------------------------------------
  // 失敗しても例外を投げず、エラー内容を後続でハンドリング可
  if (code) await supabase.auth.exchangeCodeForSession(code)

  // ------ 4. リダイレクト -------------------------------------------------
  return NextResponse.redirect(new URL(next, req.url))
}

/**
 * POST メソッドが誤って叩かれた場合のフォールバック。
 * （不要なら削除可）
 */
export const POST = GET
