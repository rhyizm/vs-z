"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";

interface NextAuthSessionProviderWrapperProps {
  children: React.ReactNode;
}

export default function NextAuthSessionProviderWrapper({
  children,
}: NextAuthSessionProviderWrapperProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
