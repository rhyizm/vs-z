'use client'

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface AuthProps {
  providers?: ('google' | 'github' | 'twitter')[]
}

export default function AuthenticationForm({
  providers = ['google'],
}: AuthProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth');

  const redirectTo = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const origin = location.origin
    const next = searchParams.get('redirectTo') ?? '/'
    return `${origin}/api/auth/supabase/callback?next=${encodeURIComponent(next)}`
  }, [searchParams])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent) => {
        if (event === 'SIGNED_IN') {
          router.replace(searchParams.get('redirectTo') || '/')
        }
      },
    )
    return () => subscription.unsubscribe()
  }, [router, searchParams])


  return (
    <div className="p-10 max-w-sm m-auto">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={providers}
        redirectTo={redirectTo}
        showLinks={true}
        localization={{
          variables: {
            sign_in: {
              email_label: t('email'),
              password_label: t('password'),
              button_label: t('signIn'),
              link_text: t('hasAccount'),
              email_input_placeholder: t('email'),
              password_input_placeholder: t('password'),
            },
            sign_up: {
              email_label: t('email'),
              password_label: t('password'),
              button_label: t('signUp'),
              link_text: t('noAccount'),
              email_input_placeholder: t('email'),
              password_input_placeholder: t('password'),
            },
            forgotten_password: {
              email_label: t('email'),
              button_label: t('resetPassword'),
              link_text: t('forgotPassword'),
              email_input_placeholder: t('email'),
            },
          },
        }}
      />
    </div>
  )
}
