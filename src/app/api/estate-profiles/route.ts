import { NextResponse } from 'next/server'

import { getLatestEstateProfile, upsertEstateProfile } from '@/lib/estate-profiles/service'
import type { EstateProfilePayload } from '@/types/estate-profile'
import { isMissingTableError } from '@/lib/db/errors'
import { authenticateEstateProfileRequest } from './auth'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const authResult = await authenticateEstateProfileRequest(request)

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
    const result = await upsertEstateProfile(userId, body)
    const status = result.created ? 201 : 200
    return NextResponse.json(result, { status })
  } catch (error) {
    const message = isMissingTableError(error)
      ? 'データベースのテーブルが存在しません。`pnpm db:migrate` を実行して最新のスキーマを反映してください。'
      : error instanceof Error
        ? error.message
        : 'プロファイルの保存に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const authResult = await authenticateEstateProfileRequest(request)

  if ('error' in authResult) {
    return authResult.error
  }

  try {
    const profile = await getLatestEstateProfile(authResult.userId)

    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 200 })
    }

    return NextResponse.json({ profile }, { status: 200 })
  } catch (error) {
    const message = isMissingTableError(error)
      ? 'データベースのテーブルが存在しません。`pnpm db:migrate` を実行して最新のスキーマを反映してください。'
      : error instanceof Error
        ? error.message
        : 'プロファイルの取得に失敗しました。'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
