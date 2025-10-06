import { NextResponse } from 'next/server'

import { ensureLineUser } from '@/lib/users/service'
import {
  fetchLineProfileWithAccessToken,
  verifyLineAccessToken,
  verifyLineIdToken,
} from '@/lib/liff/server'

export const runtime = 'nodejs'

type SyncLineSessionRequest = {
  idToken?: string
  accessToken?: string
  tokenType?: 'id' | 'access'
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

  try {
    const tokenType = body?.tokenType ?? (body?.accessToken ? 'access' : 'id')

    if (tokenType === 'access') {
      const accessToken = body?.accessToken

      if (!accessToken) {
        return NextResponse.json({ error: 'accessTokenが必要です。' }, { status: 400 })
      }

      await verifyLineAccessToken(accessToken)
      const profileResponse = await fetchLineProfileWithAccessToken(accessToken)

      const lineSub = profileResponse.userId

      if (!lineSub) {
        return NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 400 })
      }

      const result = await ensureLineUser({
        liffSub: lineSub,
        displayName: body?.profile?.displayName ?? profileResponse.displayName ?? null,
        imageUrl: body?.profile?.pictureUrl ?? profileResponse.pictureUrl ?? null,
      })

      return NextResponse.json(
        { userId: result.id, created: result.created, lineSub },
        { status: result.created ? 201 : 200 },
      )
    }

    const idToken = body?.idToken

    if (!idToken) {
      return NextResponse.json({ error: 'idTokenが必要です。' }, { status: 400 })
    }

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
