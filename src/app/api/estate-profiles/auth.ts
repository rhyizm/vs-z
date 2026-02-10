import { NextResponse } from 'next/server'

import { ensureLineUser } from '@/lib/users/service'
import {
  fetchLineProfileWithAccessToken,
  verifyLineAccessToken,
  verifyLineIdToken,
} from '@/lib/liff/server'

type AuthSuccess = {
  userId: string
}

type AuthFailure = {
  error: NextResponse
}

export async function authenticateEstateProfileRequest(request: Request): Promise<AuthSuccess | AuthFailure> {
  const shouldSkipLineAuth =
    process.env.NEXT_PUBLIC_SKIP_LINE_AUTH === 'true' && process.env.NODE_ENV !== 'production'

  if (shouldSkipLineAuth) {
    try {
      const user = await ensureLineUser({
        liffSub: 'dev-user',
        displayName: 'Dev User',
        imageUrl: null,
      })

      return { userId: user.id }
    } catch (error) {
      console.error('Failed to ensure dev LINE user:', error)
      return {
        error: NextResponse.json(
          { error: '開発用LINEユーザーの登録に失敗しました。' },
          { status: 500 },
        ),
      }
    }
  }

  const authorization = request.headers.get('authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'LINEの認証情報が不足しています。' }, { status: 401 }),
    }
  }

  const token = authorization.slice('Bearer '.length).trim()

  if (!token) {
    return {
      error: NextResponse.json({ error: 'LINEの認証情報が不足しています。' }, { status: 401 }),
    }
  }

  const requestedUserId = request.headers.get('x-line-user-id')?.trim() ?? null
  const tokenTypeHeader = request.headers.get('x-line-token-type')?.toLowerCase()

  try {
    if (tokenTypeHeader === 'access') {
      await verifyLineAccessToken(token)
      const profile = await fetchLineProfileWithAccessToken(token)

      const lineSub = profile.userId

      if (!lineSub) {
        return {
          error: NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 401 }),
        }
      }

      if (requestedUserId && requestedUserId !== lineSub) {
        return {
          error: NextResponse.json({ error: 'LINEユーザーIDが一致しません。' }, { status: 403 }),
        }
      }

      try {
        const user = await ensureLineUser({
          liffSub: lineSub,
          displayName: profile.displayName ?? null,
          imageUrl: profile.pictureUrl ?? null,
        })

        return { userId: user.id }
      } catch (error) {
        console.error('Failed to persist LINE user:', error)
        return {
          error: NextResponse.json(
            { error: 'ユーザー情報の登録に失敗しました。しばらくしてから再試行してください。' },
            { status: 500 },
          ),
        }
      }
    }

    const linePayload = await verifyLineIdToken(token)

    if (!linePayload.sub) {
      return {
        error: NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 401 }),
      }
    }

    if (requestedUserId && requestedUserId !== linePayload.sub) {
      return {
        error: NextResponse.json({ error: 'LINEユーザーIDが一致しません。' }, { status: 403 }),
      }
    }

    try {
      const user = await ensureLineUser({
        liffSub: linePayload.sub,
        displayName: linePayload.name ?? null,
        imageUrl: linePayload.picture ?? null,
      })

      return { userId: user.id }
    } catch (error) {
      console.error('Failed to persist LINE user:', error)
      return {
        error: NextResponse.json(
          { error: 'ユーザー情報の登録に失敗しました。しばらくしてから再試行してください。' },
          { status: 500 },
        ),
      }
    }
  } catch (error) {
    console.error('Failed to authenticate LINE request:', error)
    return {
      error: NextResponse.json({ error: 'LINEの認証に失敗しました。' }, { status: 401 }),
    }
  }
}
