
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // レスポンスを返す
  return NextResponse.json({ request: request });
}
