import { NextResponse } from 'next/server'

import { upsertEstateProfile } from '@/lib/estate-profiles/service'
import { verifyLineIdToken } from '@/lib/liff/server'
import { ensureLineUser } from '@/lib/users/service'

import type { CloudflareBindings } from '@/lib/db/types'
import type { EstateProfilePayload } from '@/types/estate-profile'

export const runtime = 'nodejs'

export async function PUT(request: Request, context: unknown) {
  const authorization = request.headers.get('authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'LINEの認証情報が不足しています。' }, { status: 401 })
  }

  const idToken = authorization.slice('Bearer '.length)

  let linePayload: Awaited<ReturnType<typeof verifyLineIdToken>>

  try {
    linePayload = await verifyLineIdToken(idToken)
  } catch (error) {
    console.error('Failed to verify LINE ID token:', error)
    return NextResponse.json({ error: 'LINEの認証に失敗しました。' }, { status: 401 })
  }

  const requestedUserId = request.headers.get('x-line-user-id')

  if (!linePayload.sub) {
    return NextResponse.json({ error: 'LINEユーザーIDを特定できませんでした。' }, { status: 401 })
  }

  if (requestedUserId && requestedUserId !== linePayload.sub) {
    return NextResponse.json({ error: 'LINEユーザーIDが一致しません。' }, { status: 403 })
  }

  const bindings = (context as { env?: CloudflareBindings }).env

  let userId: string

  try {
    const user = await ensureLineUser(bindings, {
      liffSub: linePayload.sub,
      displayName: linePayload.name ?? null,
      imageUrl: linePayload.picture ?? null,
    })
    userId = user.id
  } catch (error) {
    console.error('Failed to persist LINE user:', error)
    return NextResponse.json(
      { error: 'ユーザー情報の登録に失敗しました。しばらくしてから再試行してください。' },
      { status: 500 },
    )
  }

  const { params } = context as { params?: { profileId?: string } }
  const profileId = params?.profileId

  if (!profileId) {
    return NextResponse.json({ error: 'プロファイルIDが指定されていません。' }, { status: 400 })
  }

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

  body.id = profileId

  try {
    const result = await upsertEstateProfile(bindings, userId, body)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'プロファイルの更新に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
