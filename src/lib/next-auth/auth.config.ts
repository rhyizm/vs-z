import Credentials from 'next-auth/providers/credentials';
import { verifyLineIdToken } from '@/lib/liff';

export const authConfig = {
  providers: [
    Credentials({
      credentials: {
        idToken: { label: 'LINE ID Token', type: 'text' },
        userId: { label: 'LINE User ID', type: 'text' },
        displayName: { label: 'Display Name', type: 'text' },
        pictureUrl: { label: 'Profile Image URL', type: 'text' },
        email: { label: 'Email', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) {
          throw new Error('LINE ID token is missing');
        }

        const verification = await verifyLineIdToken(credentials.idToken);

        const userId = credentials.userId ?? verification.sub;

        if (verification.sub !== userId) {
          throw new Error('LINE user ID mismatch');
        }

        return {
          id: verification.sub,
          name: credentials.displayName ?? verification.name ?? null,
          email: credentials.email ?? verification.email ?? null,
          image: credentials.pictureUrl ?? verification.picture ?? null,
        };
      }
    }),
  ],
  pages: {
    signIn: '/auth/nextauth/signin',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name ?? undefined;
        token.email = user.email ?? undefined;
        // NextAuth stores avatar url in picture
        (token as { picture?: string | null }).picture = user.image ?? undefined;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? null;
        session.user.image = (token as { picture?: string | null }).picture ?? null;
      }

      return session;
    },
  },
};
