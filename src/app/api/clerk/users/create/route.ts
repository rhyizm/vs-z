import { NextResponse } from 'next/server';

import { createUser, serializeUser } from '@/lib/clerk/server';

export const runtime = 'nodejs';

type CreateUserRequest = {
  externalId?: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  unsafeMetadata?: Record<string, unknown>;
  publicMetadata?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateUserRequest;
    const externalId = body?.externalId;

    if (!externalId) {
      return NextResponse.json({ error: 'externalId is required' }, { status: 400 });
    }

    const user = await createUser({
      externalId,
      emailAddress: body.emailAddress,
      firstName: body.firstName,
      lastName: body.lastName,
      unsafeMetadata: body.unsafeMetadata,
      publicMetadata: body.publicMetadata,
    });

    return NextResponse.json({ user: serializeUser(user) }, { status: 201 });
  } catch (error) {
    const status =
      typeof error === 'object' && error && 'status' in error && typeof error.status === 'number'
        ? error.status
        : 400;

    const message = error instanceof Error ? error.message : 'Failed to create Clerk user.';

    return NextResponse.json({ error: message }, { status });
  }
}
