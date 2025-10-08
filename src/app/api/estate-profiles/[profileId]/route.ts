import { NextResponse } from 'next/server'

import { upsertEstateProfile } from '@/lib/estate-profiles/service'
import type { EstateProfilePayload } from '@/types/estate-profile'
import { isMissingTableError } from '@/lib/db/errors'
import { authenticateEstateProfileRequest } from '../auth'

export const runtime = 'nodejs'

export async function PUT(request: Request, context: unknown) {
  const authResult = await authenticateEstateProfileRequest(request)

  if ('error' in authResult) {
    return authResult.error
  }

  const userId = authResult.userId

  const params = await (context as { params?: { profileId?: string } | Promise<{ profileId?: string }> }).params
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
    const result = await upsertEstateProfile(userId, body)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    const message = isMissingTableError(error)
      ? 'データベースのテーブルが存在しません。`pnpm db:migrate` を実行して最新のスキーマを反映してください。'
      : error instanceof Error
        ? error.message
        : 'プロファイルの更新に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
