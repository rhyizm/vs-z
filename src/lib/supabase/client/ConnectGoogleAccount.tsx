'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Link, Check } from 'lucide-react'

interface ConnectGoogleAccountProps {
  scope: string;
  linked: boolean;
  connectedText: string;
  connectText: string;
}

export default function ConnectGoogleAccount({
  scope,
  linked,
  connectedText,
  connectText,
}: ConnectGoogleAccountProps) {
  const supabase = createClient()

  /** Google 連携を開始 */
  const connectGoogle = async () => {
    const { data, error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: {
        scopes: scope,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
        redirectTo: `${location.origin}/api/auth/supabase/callback?next=/settings`,
      },
    })
    if (error) return alert(error.message)
    window.location.assign(data.url)
  }

  return linked ? (
    <Button variant="outline" disabled className="cursor-default">
      <Check className="mr-2 h-4 w-4" />
      {connectedText}
    </Button>
  ) : (
    <Button variant="outline" onClick={connectGoogle}>
      <Link className="mr-2 h-4 w-4" />
      {connectText}
    </Button>
  )
}
