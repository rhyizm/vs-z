'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Session } from '@supabase/supabase-js'
import ConnectGoogleAccount from '@/lib/supabase/client/ConnectGoogleAccount'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define props interface
interface AccountConnectionsProps {
  title: string;
  description: string;
  googleConnectedText: string;
  googleConnectText: string;
}

export default function AccountConnections({
  title,
  description,
  googleConnectedText,
  googleConnectText,
}: AccountConnectionsProps) {
  const supabase = createClient()
  const [linked, setLinked] = useState<boolean>(false)

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
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ConnectGoogleAccount
          scope={googleScope}
          linked={linked}
          connectedText={googleConnectedText}
          connectText={googleConnectText}
        />
      </CardContent>
    </Card>
  )
}
