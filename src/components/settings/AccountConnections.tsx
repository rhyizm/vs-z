'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { useLiff } from '@/lib/liff';

// Define props interface
interface AccountConnectionsProps {
  title: string;
  description: string;
  lineConnectedText: string;
  lineConnectText: string;
  lineDisconnectText: string;
  syncingText: string;
}

export default function AccountConnections({
  title,
  description,
  lineConnectedText,
  lineConnectText,
  lineDisconnectText,
  syncingText,
}: AccountConnectionsProps) {
  const { status } = useSession();
  const { isLoggedIn, login, logout, syncingSession } = useLiff();

  const isConnected = isLoggedIn && status === 'authenticated';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" viewBox="0 0 36 32" aria-hidden="true">
              <path
                fill="#06c755"
                d="M18 0C8.06 0 0 6.68 0 14.91c0 5.07 3.35 9.55 8.46 12.06-.38 1.47-1.37 5.32-1.57 6.15-.25 1.01.37 1 .78.74.32-.21 5.06-3.43 7.11-4.82 1.05.16 2.14.25 3.22.25 9.94 0 18-6.68 18-14.91C36 6.68 27.94 0 18 0"
              />
            </svg>
            <div className="flex flex-col">
              <span>LINE</span>
              {isConnected && (
                <span className="text-xs text-muted-foreground">{lineConnectedText}</span>
              )}
            </div>
          </div>
          <Button
            variant={isConnected ? 'secondary' : 'default'}
            disabled={syncingSession}
            onClick={() => {
              if (isConnected) {
                void logout();
              } else {
                login();
              }
            }}
          >
            {syncingSession
              ? syncingText
              : isConnected
                ? lineDisconnectText
                : lineConnectText}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
