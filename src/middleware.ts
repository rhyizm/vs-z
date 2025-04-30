import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
// import { updateSession } from './lib/supabase/middleware'; // Keep commented out

const locales = ['en', 'ja', 'fr'] as const;
const defaultLocale = 'en';

const nextIntlMiddleware = createMiddleware({
  locales: locales,
  defaultLocale: defaultLocale,
  localePrefix: 'as-needed'
});

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Keep Supabase middleware commented out for debugging
  /*
  const supabaseResponse = await updateSession(request);

  if (
    supabaseResponse.headers.get('location') ||
    supabaseResponse.headers.get('x-middleware-rewrite')
  ) {
    return supabaseResponse;
  }
  */

  // Run only the next-intl middleware
  const nextIntlResponse = nextIntlMiddleware(request);
  
  // console.log(nextIntlResponse); // Keep or remove console.log as needed

  /*
  // Merge headers (keep commented out)
  supabaseResponse.headers.forEach((value, key) => {
    const lowerCaseKey = key.toLowerCase();
    if (!['x-middleware-rewrite', 'location', 'content-type', 'content-length'].includes(lowerCaseKey)) {
      nextIntlResponse.headers.set(key, value);
    }
  });
  */

  return nextIntlResponse;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};