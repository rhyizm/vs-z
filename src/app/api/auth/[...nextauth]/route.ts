import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({ error: 'NextAuth endpoint is no longer available.' }, { status: 410 })
}

export async function POST() {
  return NextResponse.json({ error: 'NextAuth endpoint is no longer available.' }, { status: 410 })
}
