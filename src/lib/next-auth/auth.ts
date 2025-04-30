import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// NextAuthを初期化し、ハンドラーとauthヘルパーをエクスポート
export const {
  handlers: { GET, POST }, // App Router用のAPIルートハンドラー
  auth, // サーバーコンポーネントやAPIルートでセッションを取得するためのヘルパー
  signIn, // サーバーアクションからサインインするためのヘルパー
  signOut, // サーバーアクションからサインアウトするためのヘルパー
} = NextAuth({
  ...authConfig, // auth.config.ts から設定を読み込む
  session: {
    strategy: 'jwt', // JWTセッション戦略を使用 (データベースセッションも可能)
  },
  secret: process.env.AUTH_SECRET, // セッション暗号化のためのシークレットキー
});
