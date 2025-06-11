import NextAuth, { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authConfig } from './auth.config';

// NextAuth configuration
export const authOptions: NextAuthOptions = {
  ...authConfig, // auth.config.ts から設定を読み込む
  session: {
    strategy: 'jwt', // JWTセッション戦略を使用 (データベースセッションも可能)
  },
  secret: process.env.AUTH_SECRET, // セッション暗号化のためのシークレットキー
};

// NextAuth handler
const handler = NextAuth(authOptions);

// Export for API routes
export { handler as GET, handler as POST };

// Auth helper for server components
export async function auth() {
  return await getServerSession(authOptions);
}
