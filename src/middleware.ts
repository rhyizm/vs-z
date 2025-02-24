// ./src/middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { i18nRouter } from 'next-i18n-router';
import { i18nConfig } from '../i18nConfig';

export function middleware(request: NextRequest): NextResponse {
  return i18nRouter(request, i18nConfig);
}

// このmiddlewareを適用する範囲を指定
export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)',
};
