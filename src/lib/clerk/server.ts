import { clerkClient } from '@clerk/nextjs/server';

type ClerkEmailAddress = {
  id: string;
  emailAddress: string;
  verification?: { status?: string | null } | null;
};

type ClerkUser = {
  id: string;
  externalId: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: ClerkEmailAddress[];
  primaryEmailAddressId: string | null;
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
};

type ClerkSession = {
  id: string;
  clientId: string;
  userId: string;
  status: string;
  lastActiveAt: number;
  expireAt: number;
  abandonAt: number;
  createdAt: number;
  updatedAt: number;
  lastActiveOrganizationId: string | null;
  actor: Record<string, unknown> | null;
};

type ClerkToken = {
  jwt: string;
};

export type MaybeUser = ClerkUser | null;

export type SerializedEmailAddress = {
  id: string;
  emailAddress: string;
  verificationStatus: string | null;
  isPrimary: boolean;
};

export type SerializedUser = {
  id: string;
  externalId: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  emailAddresses: SerializedEmailAddress[];
  publicMetadata: Record<string, unknown>;
  unsafeMetadata: Record<string, unknown>;
};

export type SerializedSession = {
  id: string;
  clientId: string;
  userId: string;
  status: string;
  lastActiveAt: number;
  expireAt: number;
  abandonAt: number;
  createdAt: number;
  updatedAt: number;
  lastActiveOrganizationId: string | null;
  actor: Record<string, unknown> | null;
};

export type CreateClerkUserParams = {
  externalId: string;
  emailAddress?: string;
  firstName?: string;
  lastName?: string;
  unsafeMetadata?: Record<string, unknown>;
  publicMetadata?: Record<string, unknown>;
};

export type CreateClerkSessionOptions = {
  template?: string;
  expiresInSeconds?: number;
};

export type CreateClerkSessionResult = {
  session: ClerkSession;
  token: ClerkToken;
};

export function serializeUser(user: ClerkUser): SerializedUser {
  return {
    id: user.id,
    externalId: user.externalId,
    firstName: user.firstName,
    lastName: user.lastName,
    imageUrl: user.imageUrl,
    emailAddresses: user.emailAddresses.map((email) => ({
      id: email.id,
      emailAddress: email.emailAddress,
      verificationStatus: email.verification?.status ?? null,
      isPrimary: email.id === user.primaryEmailAddressId,
    })),
    publicMetadata: user.publicMetadata,
    unsafeMetadata: user.unsafeMetadata,
  };
}

export function serializeSession(session: ClerkSession): SerializedSession {
  return {
    id: session.id,
    clientId: session.clientId,
    userId: session.userId,
    status: session.status,
    lastActiveAt: session.lastActiveAt,
    expireAt: session.expireAt,
    abandonAt: session.abandonAt,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    lastActiveOrganizationId: session.lastActiveOrganizationId ?? null,
    actor: session.actor,
  };
}

export async function getUserByExternalId(externalId: string): Promise<MaybeUser> {
  if (!externalId) {
    throw new Error('externalId is required to look up a Clerk user.');
  }

  const client = await clerkClient();
  const { data } = (await client.users.getUserList({
    externalId: [externalId],
    limit: 1,
  })) as { data: ClerkUser[] };

  if (!data.length) {
    return null;
  }

  return data[0] ?? null;
}

export async function createUser(params: CreateClerkUserParams): Promise<ClerkUser> {
  const { externalId, emailAddress, firstName, lastName, unsafeMetadata, publicMetadata } = params;

  if (!externalId) {
    throw new Error('externalId is required to create a Clerk user.');
  }

  const client = await clerkClient();

  return (await client.users.createUser({
    externalId,
    emailAddress: emailAddress ? [emailAddress] : undefined,
    firstName,
    lastName,
    skipPasswordRequirement: true,
    unsafeMetadata,
    publicMetadata,
  })) as ClerkUser;
}

export async function createSession(
  userId: string,
  options: CreateClerkSessionOptions = {},
): Promise<CreateClerkSessionResult> {
  if (!userId) {
    throw new Error('userId is required to create a Clerk session.');
  }

  const client = await clerkClient();

  const session = (await client.sessions.createSession({
    userId,
  })) as ClerkSession;

  const token = (await client.sessions.getToken(
    session.id,
    options.template,
    options.expiresInSeconds,
  )) as ClerkToken;

  return {
    session,
    token,
  };
}
