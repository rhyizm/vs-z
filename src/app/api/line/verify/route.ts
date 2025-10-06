import { NextResponse } from 'next/server';

import { getLineChannelId, verifyLineIdToken } from '@/lib/liff/server';

export const runtime = 'nodejs';

type VerifyLineTokenRequest = {
  idToken?: string;
  nonce?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as VerifyLineTokenRequest;
    const idToken = body?.idToken;

    if (!idToken) {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    const payload = await verifyLineIdToken(idToken);

    const expectedIssuer = 'https://access.line.me';
    if (payload.iss !== expectedIssuer) {
      return NextResponse.json({ error: 'Unexpected issuer' }, { status: 401 });
    }

    const channelId = getLineChannelId();
    if (channelId && payload.aud !== channelId) {
      return NextResponse.json({ error: 'Audience mismatch' }, { status: 401 });
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (payload.exp <= nowInSeconds) {
      return NextResponse.json({ error: 'Token expired' }, { status: 401 });
    }

    if (body.nonce && payload.nonce && body.nonce !== payload.nonce) {
      return NextResponse.json({ error: 'Nonce mismatch' }, { status: 401 });
    }

    return NextResponse.json({ payload });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to verify LINE ID token.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
