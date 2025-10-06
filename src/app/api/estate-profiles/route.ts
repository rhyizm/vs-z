import { NextResponse } from 'next/server'

import { getLatestEstateProfile, upsertEstateProfile } from '@/lib/estate-profiles/service'
import { verifyLineIdToken } from '@/lib/liff/server'
import { ensureLineUser } from '@/lib/users/service'

import type { CloudflareBindings } from '@/lib/db/types'
import type { EstateProfilePayload } from '@/types/estate-profile'

export const runtime = 'nodejs'

async function authenticateRequest(
  request: Request,
  bindings: CloudflareBindings | undefined,
) {
  const authorization = request.headers.get('authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      error: NextResponse.json({ error: 'LINEの認証情報が不足しています。' }, { status: 401 }),
    }
  }

  const idToken = authorization.slice('Bearer '.length)

  let linePayload: Awaited<ReturnType<typeof verifyLineIdToken>>

  try {
    linePayload = await verifyLineIdToken(idToken)
  } catch (error) {
    console.error('Failed to verify LINE ID token:', error)
    return {
      error: NextResponse.json({ error: 'LINEの認証に失敗しました。' }, { status: 401 }),
    }
  }

  const requestedUserId = request.headers.get('x-line-user-id')

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
    const user = await ensureLineUser(bindings, {
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
}

export async function POST(request: Request, context: unknown) {
  const bindings = (context as { env?: CloudflareBindings }).env

  const authResult = await authenticateRequest(request, bindings)

  if ('error' in authResult) {
    return authResult.error
  }

  const userId = authResult.userId

  let body: EstateProfilePayload

  try {
    body = (await request.json()) as EstateProfilePayload
  } catch {
    return NextResponse.json(
      { error: 'リクエストボディが不正です。' },
      { status: 400 },
    )
  }

  if (!body) {
    return NextResponse.json({ error: '保存データが見つかりません。' }, { status: 400 })
  }

  if (!body.currentStep || !body.familyData || !body.assetData || !body.dashboardData || !body.taxCalculation) {
    return NextResponse.json({ error: '必要なデータが不足しています。' }, { status: 400 })
  }

  try {
    const result = await upsertEstateProfile(bindings, userId, body)
    const status = result.created ? 201 : 200
    return NextResponse.json(result, { status })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'プロファイルの保存に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request, context: unknown) {
  const bindings = (context as { env?: CloudflareBindings }).env

  const authResult = await authenticateRequest(request, bindings)

  if ('error' in authResult) {
    return authResult.error
  }

  try {
    const profile = await getLatestEstateProfile(bindings, authResult.userId)

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'プロファイルの取得に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
