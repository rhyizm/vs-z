import type { Metadata } from 'next';
import './globals.css';
import { LiffProvider } from '@/lib/liff';
import { MobileSidebarProvider } from '@/components/layout/MobileSidebarContext';
import { Content, Wrapper } from '@/components/layout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

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
      <body className="font-sans antialiased">
        <LiffProvider>
          <ThemeProvider>
            <MobileSidebarProvider>
              <Wrapper>
                <Content>{children}</Content>
              </Wrapper>
            </MobileSidebarProvider>
          </ThemeProvider>
        </LiffProvider>
      </body>
    </html>
  );
}
