import { eq } from 'drizzle-orm'

import { users } from '@/db/schema'
import { getDb } from '@/lib/db/client'

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

export async function ensureLineUser(params: EnsureLineUserParams): Promise<EnsureLineUserResult> {
  const db = getDb()
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
