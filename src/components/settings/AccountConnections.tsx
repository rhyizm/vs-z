'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'
import ConnectGoogleAccount from '@/lib/supabase/client/ConnectGoogleAccount'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AccountConnections() {
  const supabase = createClient()
  const [linked, setLinked] = useState<boolean>(false) // Default to false

  /** session → Google 連携の有無を state に反映 */
  const handleSession = (session: Session | null) => {
    const hasGoogle = session?.user?.identities?.some(
      (i) => i.provider === 'google'
    )
    setLinked(!!hasGoogle)
  }

  useEffect(() => {
    // 1) ページロード直後：ローカルセッションで判定
    supabase.auth.getSession().then(({ data: { session } }) =>
      handleSession(session)
    )

    // 2) 以降は auth イベントで都度更新
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        handleSession(session)
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  // Define the desired scope for Google connection
  // TODO: Consider making this configurable if needed elsewhere
  const googleScope = 'email profile https://www.googleapis.com/auth/calendar.readonly'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Connections</CardTitle>
        <CardDescription>Manage your connected accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <ConnectGoogleAccount scope={googleScope} linked={linked} />
      </CardContent>
    </Card>
  )
}
