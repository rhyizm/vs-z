import { NextResponse } from 'next/server'

import { ensureLineUser } from '@/lib/users/service'
import {
  LineTokenVerificationError,
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

    const synchroniseWithAccessToken = async (accessToken: string) => {
      if (!accessToken || !accessToken.trim()) {
        return NextResponse.json({ error: 'accessTokenが必要です。' }, { status: 400 })
      }

      const trimmedAccessToken = accessToken.trim()

      await verifyLineAccessToken(trimmedAccessToken)
      const profileResponse = await fetchLineProfileWithAccessToken(trimmedAccessToken)

      const lineSub = profileResponse.userId

      if (!lineSub) {
        return NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 400 })
      }

      const result = await ensureLineUser({
        liffSub: lineSub,
        displayName: profileResponse.displayName ?? null,
        imageUrl: profileResponse.pictureUrl ?? null,
      })

      return NextResponse.json(
        { userId: result.id, created: result.created, lineSub, tokenType: 'access' },
        { status: result.created ? 201 : 200 },
      )
    }

    if (tokenType === 'access') {
      return synchroniseWithAccessToken(body?.accessToken ?? '')
    }

    const idToken = body?.idToken

    if (!idToken || !idToken.trim()) {
      return NextResponse.json({ error: 'idTokenが必要です。' }, { status: 400 })
    }

    try {
      const trimmedIdToken = idToken.trim()
      const payload = await verifyLineIdToken(trimmedIdToken)

      if (!payload.sub) {
        return NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 400 })
      }

      const result = await ensureLineUser({
        liffSub: payload.sub,
        displayName: payload.name ?? null,
        imageUrl: payload.picture ?? null,
      })

      return NextResponse.json(
        { userId: result.id, created: result.created, lineSub: payload.sub, tokenType: 'id' },
        { status: result.created ? 201 : 200 },
      )
    } catch (idTokenError) {
      if (
        idTokenError instanceof LineTokenVerificationError &&
        idTokenError.status === 400 &&
        (body?.accessToken ?? '').trim()
      ) {
        console.warn(
          'LINE ID token verification failed with 400. Falling back to access token verification.',
          idTokenError.detail,
        )
        return synchroniseWithAccessToken(body?.accessToken ?? '')
      }

      throw idTokenError
    }
  } catch (error) {
    console.error('Failed to synchronise LINE session:', error)
    const message = error instanceof Error ? error.message : 'LINEセッションの同期に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
