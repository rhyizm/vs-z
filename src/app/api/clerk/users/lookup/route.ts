import { NextResponse } from 'next/server';

import { getUserByExternalId, serializeUser } from '@/lib/clerk/server';

export const runtime = 'nodejs';

type LookupUserRequest = {
  externalId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LookupUserRequest;
    const externalId = body?.externalId;

    if (!externalId) {
      return NextResponse.json({ error: 'externalId is required' }, { status: 400 });
    }

    const user = await getUserByExternalId(externalId);

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to lookup Clerk user.';

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
