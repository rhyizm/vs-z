# Next.js v15 i18n & Theme Template

This is a template project for Next.js v15 (App Router) featuring internationalization (i18n) and Light/Dark mode switching capabilities.

## Features

*   **Next.js 15:** Utilizes the latest features of Next.js, including the App Router.
*   **TypeScript:** For type safety and improved developer experience.
*   **Tailwind CSS (v4):** CSS-first setup using `@import "tailwindcss"` with PostCSS plugin `@tailwindcss/postcss`.
*   **Internationalization (i18n):**
    *   Powered by `next-intl` (migrated from i18next).
    *   Supports multiple languages (English, Japanese, French configured by default).
    *   Locale-based routing (e.g., `/en`, `/ja`).
    *   Language selector component included.
    *   Translation files located in `src/messages/`.
*   **Light/Dark Mode:**
    *   Implemented using `next-themes`.
    *   Theme toggle component allows users to switch between light, dark, or system preference.
*   **Authentication:** NextAuth.js session management backed by LINE LIFF login.
*   **UI Components:** Built with shadcn/ui and Radix UI primitives.
*   **Layout Components:** Pre-built components for common layouts (Sidebar, Header, Content).
*   **Icons:** Uses `lucide-react` for a clean set of icons.
*   **Fonts:** Includes Geist Sans and Geist Mono fonts.
*   **ESLint:** Configured for code linting.
*   **DevContainer:** Full Docker development environment with VS Code integration.

## Getting Started

### Prerequisites

*   Node.js (Latest LTS recommended)
*   pnpm (or npm/yarn)

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd nextjs-v15-i18n
    ```
2.  Install dependencies:
    ```bash
    pnpm install
    # or
    # npm install
    # or
    # yarn install
    ```

### Running the Development Server

```bash
pnpm dev
# or
# npm run dev
# or
# yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The default language is English (`/en`). You can access other languages like Japanese at `/ja`.

## Available Scripts

*   `dev`: Runs the app in development mode with Turbopack.
*   `build`: Builds the app for production.
*   `start`: Starts the production server.
*   `lint`: Runs ESLint for code analysis.

## Technologies Used

*   [Next.js](https://nextjs.org/)
*   [React](https://reactjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [next-intl](https://next-intl-docs.vercel.app/)
*   [next-themes](https://github.com/pacocoursey/next-themes)
*   [NextAuth.js](https://next-auth.js.org/)
*   [shadcn/ui](https://ui.shadcn.com/)
*   [Radix UI](https://www.radix-ui.com/)
*   [lucide-react](https://lucide.dev/)

## Cloudflare D1 + Drizzle Setup

1.  Install the new tooling after pulling these changes:
    ```bash
    pnpm install
    ```
2.  Configure the credentials Drizzle needs when running migrations (exposed by Cloudflare):
    ```bash
    export CLOUDFLARE_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxx
    export CLOUDFLARE_D1_DATABASE_ID=xxxxxxxxxxxxxxxxxxxx
    export CLOUDFLARE_D1_TOKEN=xxxxxxxxxxxxxxxxxxxx
    ```
    *(You can also place the same variables in a `.env` file that is loaded before running the scripts.)*
3.  Copy `wrangler.example.toml` to `wrangler.toml` and replace the placeholder `database_id` (and other fields) with the values for your Cloudflare D1 instance. The generated migrations in `./drizzle` are referenced automatically.
4.  Generate a migration from the Drizzle schema and push it to Cloudflare D1:
    ```bash
    pnpm db:generate
    pnpm db:push
    ```
5.  For local development with `wrangler dev`, the D1 binding must be available as `env.DB`. The helper in `src/lib/db/client.ts` expects that name and will reuse the same Drizzle instance per request.

### Using the D1 binding in routes

API routes or Server Actions that run on the Edge runtime can access the database like this:

```ts
import type { D1Database } from '@/lib/db'
import { getDbFromBindings, schema } from '@/lib/db'

export const runtime = 'edge'

export async function GET(request: Request, { env }: { env: { DB: D1Database } }) {
  const db = getDbFromBindings(env)
  const profiles = await db.select().from(schema.estateProfiles)
  return Response.json({ profiles })
}
```

When deploying on Cloudflare Pages with `@cloudflare/next-on-pages`, you can alternatively obtain the bindings via `getRequestContext().env` and pass them to `getDbFromBindings`.

## Folder Structure (Key Directories)

```
/
├── public/             # Static assets
├── src/
│   ├── app/            # App Router pages and layouts
│   │   ├── [locale]/   # Locale-specific routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── api/        # API routes (auth endpoints)
│   │   │   ├── auth/   # NextAuth.js authentication routes
│   │   └── globals.css
│   ├── components/     # Reusable React components
│   │   ├── i18n/       # i18n related components (Language Selector)
│   │   ├── layout/     # Layout components (Header, Sidebar, etc.)
│   │   ├── settings/   # Settings page components
│   │   ├── theme/      # Theme related components (Provider, Toggle)
│   │   └── ui/         # shadcn/ui components (Button, Card, Input, etc.)
│   ├── lib/            # Utility libraries and configurations
│   │   └── next-auth/  # NextAuth.js configuration
│   ├── messages/       # Translation files (en, ja)
│   ├── i18n/           # i18n configuration files
│   ├── middleware.ts   # Next.js middleware for i18n routing
│   └── ...
├── next.config.ts      # Next.js configuration
├── postcss.config.mjs  # Tailwind v4 via @tailwindcss/postcss
├── tsconfig.json       # TypeScript configuration
└── package.json        # Project dependencies and scripts
```

## Internationalization (i18n)

*   **Configuration:** Managed in `src/i18n/routing.ts`. Add or remove locales in the `locales` array.
*   **Routing:** Handled by `src/middleware.ts` using `next-intl` middleware.
*   **Translations:** Add/edit JSON files in `src/messages/[locale].json`. Organized by feature namespaces (common, auth, settings, etc.).
*   **Usage in Components:** Use `getTranslations()` in Server Components or `useTranslations()` hook in Client Components from `next-intl`.
*   **Language Selection:** The `src/components/i18n/LanguageSelector.tsx` component provides a basic dropdown for switching languages.

## Authentication

This project uses NextAuth.js for session management and LINE LIFF for authentication:

*   **NextAuth.js:** JWT-based authentication configured in `src/lib/next-auth/auth.ts` and `auth.config.ts`.
*   **LIFF Integration:** Client-side login is handled by `@line/liff`; ID tokens are verified on the server via `verifyLineIdToken` in `src/lib/liff/server.ts`.
*   **Environment Variables:** Requires `AUTH_SECRET` for NextAuth, `NEXT_PUBLIC_LIFF_ID`, and `LINE_LOGIN_CHANNEL_ID` for LINE Login to integrate with Clerk.

### Supabase Authentication Setup (Alternative)

If you want to use Supabase authentication instead of NextAuth.js, you'll need to create the following files:

#### Dependencies
```bash
pnpm add @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/ssr @supabase/supabase-js
```

#### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Required Files and Content

**`src/lib/supabase/client/index.ts`** - Browser client:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

**`src/lib/supabase/server.ts`** - Server client with cookie handling:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore if called from Server Component
          }
        },
      },
    },
  );
};
```

**`src/lib/supabase/middleware.ts`** - Session management:
```typescript
import {createServerClient} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({name, value}) =>
            request.cookies.set(name, value)
          );
          cookiesToSet.forEach(({name, value, options}) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );
  await supabase.auth.getUser();
  return response;
}
```

**Authentication Form** - Uses `@supabase/auth-ui-react` with custom localization and OAuth redirect handling.

**OAuth Callback Route** - `/api/auth/supabase/callback/route.ts` handles OAuth redirects using `exchangeCodeForSession()`.

**Component Integration** - User state managed via `onAuthStateChange()` listeners, user data accessed through `user.user_metadata`, account linking via `linkIdentity()`.

**Middleware Integration** - Call `updateSession()` in your main middleware before i18n routing.

## Theme Switching

*   **Provider:** The `src/components/theme/ThemeProvider.tsx` wraps the application in `src/app/[locale]/layout.tsx`, enabling theme functionality via `next-themes`.
*   **Toggle:** The `src/components/theme/ThemeToggle.tsx` component allows users to cycle between light and dark modes. It's typically placed in the Header or Sidebar.
*   **Styling:** Theme-based styling is primarily handled by Tailwind CSS's dark mode variant (`dark:`). Configure colors in `tailwind.config.ts`.
