"use client";

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { LiffProvider } from '@/lib/liff';

interface NextAuthSessionProviderWrapperProps {
  children: React.ReactNode;
}

export default function NextAuthSessionProviderWrapper({
  children,
}: NextAuthSessionProviderWrapperProps) {
  return (
    <SessionProvider>
      <LiffProvider>{children}</LiffProvider>
    </SessionProvider>
  );
}
