import { eq } from 'drizzle-orm'

import { users } from '@/db/schema'
import { getDbFromBindings } from '@/lib/db/client'
import { getLocalD1Bindings } from '@/lib/db/local-d1'

import type { CloudflareBindings } from '@/lib/db/types'

type EnsureLineUserParams = {
  liffSub: string
  displayName?: string | null
  imageUrl?: string | null
}

type UserInsert = typeof users.$inferInsert

type EnsureLineUserResult = {
  id: string
  created: boolean
}

function assertBindings(bindings?: CloudflareBindings): asserts bindings is CloudflareBindings {
  if (!bindings) {
    throw new Error(
      'Cloudflare D1 bindings are required to access the database. Configure a binding or run `wrangler d1` to provision a local database.',
    )
  }
}

export async function ensureLineUser(
  bindings: CloudflareBindings | undefined,
  params: EnsureLineUserParams,
): Promise<EnsureLineUserResult> {
  const effectiveBindings = bindings ?? (await getLocalD1Bindings()) ?? undefined

  assertBindings(effectiveBindings)

  const db = getDbFromBindings(effectiveBindings)
  const timestamp = new Date()

  const [existing] = await db
    .select({ id: users.id, displayName: users.displayName, imageUrl: users.imageUrl })
    .from(users)
    .where(eq(users.liffSub, params.liffSub))
    .limit(1)

  if (existing) {
    const updateData: Partial<UserInsert> = {
      updatedAt: timestamp,
      lastLoginAt: timestamp,
    }

    if (params.displayName !== undefined) {
      updateData.displayName = params.displayName ?? null
    }

    if (params.imageUrl !== undefined) {
      updateData.imageUrl = params.imageUrl ?? null
    }

    await db.update(users).set(updateData).where(eq(users.id, existing.id))

    return { id: existing.id, created: false }
  }

  await db.insert(users).values({
    liffSub: params.liffSub,
    displayName: params.displayName ?? null,
    imageUrl: params.imageUrl ?? null,
    lastLoginAt: timestamp,
  })

  const [created] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.liffSub, params.liffSub))
    .limit(1)

  if (!created) {
    throw new Error('LINEユーザーの作成に失敗しました。')
  }

  return { id: created.id, created: true }
}
