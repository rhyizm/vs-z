import { NextResponse } from 'next/server';

import { createSession, serializeSession } from '@/lib/clerk/server';

export const runtime = 'nodejs';

type SessionCookieOptions = {
  domain?: string;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  secure?: boolean;
  maxAge?: number;
};

type CreateSessionRequest = {
  userId?: string;
  template?: string;
  expiresInSeconds?: number;
  setCookie?: boolean;
  cookieOptions?: SessionCookieOptions;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateSessionRequest;
    const userId = body?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const { session, token } = await createSession(userId, {
      template: body.template,
      expiresInSeconds: body.expiresInSeconds,
    });

    const response = NextResponse.json({
      session: serializeSession(session),
      token: token.jwt,
    });

    if (body.setCookie) {
      const options = body.cookieOptions ?? {};

      response.cookies.set({
        name: '__session',
        value: token.jwt,
        httpOnly: true,
        sameSite: options.sameSite ?? 'lax',
        secure: options.secure ?? true,
        path: options.path ?? '/',
        domain: options.domain,
        maxAge: options.maxAge,
      });
    }

    return response;
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
        ? error.status
        : 400;

    const message = error instanceof Error ? error.message : 'Failed to create Clerk session.';

    return NextResponse.json({ error: message }, { status });
  }
}
