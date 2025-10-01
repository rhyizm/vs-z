import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import NextAuthSessionProviderWrapper from '@/lib/next-auth/components/NextAuthSessionProviderWrapper';
import { MobileSidebarProvider } from '@/components/layout/MobileSidebarContext';
import { Content, Wrapper } from '@/components/layout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VS-Z',
  description: 'Okuni-zei Destroyer',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NextAuthSessionProviderWrapper>
          <ThemeProvider>
            <MobileSidebarProvider>
              <Wrapper>
                <Content>{children}</Content>
              </Wrapper>
            </MobileSidebarProvider>
          </ThemeProvider>
        </NextAuthSessionProviderWrapper>
      </body>
    </html>
  );
}
