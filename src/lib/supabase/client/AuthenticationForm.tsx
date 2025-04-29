'use client'

import { useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface AuthProps {
  providers?: ('google' | 'github' | 'twitter')[]
}

export default function AuthenticationForm({
  providers = ['google'],
}: AuthProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useTranslation('auth') // Load the 'auth' namespace

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
              email_label: t('authUI.sign_in.email_label'),
              password_label: t('authUI.sign_in.password_label'),
              button_label: t('authUI.sign_in.button_label'),
              link_text: t('authUI.sign_in.link_text'),
            },
            sign_up: {
              email_label: t('authUI.sign_up.email_label'),
              password_label: t('authUI.sign_up.password_label'),
              button_label: t('authUI.sign_up.button_label'),
              link_text: t('authUI.sign_up.link_text'),
            },
            forgotten_password: {
              email_label: t('authUI.forgotten_password.email_label'),
              button_label: t('authUI.forgotten_password.button_label'),
              link_text: t('authUI.forgotten_password.link_text'),
            },
          },
        }}
      />
    </div>
  )
}
