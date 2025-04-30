import Credentials from 'next-auth/providers/credentials';
// import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';

export const authConfig = {
  providers: [
    Credentials({
      // ログインフォームに表示されるフィールドを定義します
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // ここでユーザー認証ロジックを実装します
        // credentialsオブジェクトには、ユーザーがフォームに入力した値が含まれます
        // 例: const { email, password } = credentials;

        // データベースからユーザーを検索し、パスワードを検証するなどの処理を行います
        // bcryptなどのライブラリを使用してパスワードをハッシュ化し、比較することが推奨されます

        // --- ダミー認証ロジック ---
        // 本番環境では実際の認証ロジックに置き換えてください
        console.log('Credentials received:', credentials);
        // 簡単な例: emailとpasswordが提供されていればダミーユーザーを返す
        if (credentials?.email && credentials?.password) {
          // 実際のアプリケーションでは、ここでデータベースを検索します
          const user = { id: '1', name: 'Dummy User', email: credentials.email as string };
          console.log('Dummy user found:', user);
          return user; // 認証成功 -> ユーザーオブジェクトを返す
        } else {
          console.log('Invalid credentials');
          return null; // 認証失敗 -> nullを返す
        }
        // --- ダミー認証ロジックここまで ---
      }
    }),
    // 他のプロバイダーもここに追加できます
    // 例:
    // GitHub({
    //   clientId: process.env.AUTH_GITHUB_ID,
    //   clientSecret: process.env.AUTH_GITHUB_SECRET,
    // }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: '/auth/nextauth/signin', // 必要に応じてカスタムサインインページを指定
    // signOut: '/auth/signout',
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for email/passwordless login)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    // authorized({ auth, request: { nextUrl } }) {
    //   const isLoggedIn = !!auth?.user;
    //   const isOnDashboard = nextUrl.pathname.startsWith('/dashboard'); // 保護したいパスを指定
    //   if (isOnDashboard) {
    //     if (isLoggedIn) return true;
    //     return false; // Redirect unauthenticated users to login page
    //   } else if (isLoggedIn) {
    //     // ログイン済みのユーザーがログインページなどにアクセスした場合のリダイレクト先
    //     // return Response.redirect(new URL('/dashboard', nextUrl));
    //   }
    //   return true;
    // },
    // jwt({ token, user }) {
    //   if (user) { // User is available during sign-in
    //     token.id = user.id
    //   }
    //   return token
    // },
    // session({ session, token }) {
    //   session.user.id = token.id as string;
    //   return session
    // },
  },
  // secret: process.env.AUTH_SECRET, // auth.ts で設定するため、ここでは不要な場合が多い
  // trustHost: true, // auth.ts で設定
};
