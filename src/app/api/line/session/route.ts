import { NextResponse } from 'next/server'

import { ensureLineUser } from '@/lib/users/service'
import { verifyLineIdToken } from '@/lib/liff/server'

export const runtime = 'nodejs'

type SyncLineSessionRequest = {
  idToken?: string
  profile?: {
    displayName?: string | null
    pictureUrl?: string | null
  }
}

export async function POST(request: Request) {
  let body: SyncLineSessionRequest

  try {
    body = (await request.json()) as SyncLineSessionRequest
  } catch {
    return NextResponse.json({ error: 'リクエストボディが不正です。' }, { status: 400 })
  }

  const idToken = body?.idToken

  if (!idToken) {
    return NextResponse.json({ error: 'idTokenが必要です。' }, { status: 400 })
  }

  try {
    const payload = await verifyLineIdToken(idToken)

    if (!payload.sub) {
      return NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 400 })
    }

    const result = await ensureLineUser({
      liffSub: payload.sub,
      displayName: body?.profile?.displayName ?? payload.name ?? null,
      imageUrl: body?.profile?.pictureUrl ?? payload.picture ?? null,
    })

    return NextResponse.json(
      { userId: result.id, created: result.created, lineSub: payload.sub },
      { status: result.created ? 201 : 200 },
    )
  } catch (error) {
    console.error('Failed to synchronise LINE session:', error)
    const message = error instanceof Error ? error.message : 'LINEセッションの同期に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
