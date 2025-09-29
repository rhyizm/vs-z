'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
      // Prevent flash of incorrect theme
      enableColorScheme
      // Avoid hydration mismatch by forcing client-side only
      storageKey="theme"
    >
      {children}
    </NextThemesProvider>
  );
}
