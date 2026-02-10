import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: '相続税シミュレーター',
  description:
    '相続税の概算を3分で把握できる無料シミュレーター。家族の未来を守るための相続対策を今すぐ始めましょう。',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function Page() {
  return <LandingPage />;
}
