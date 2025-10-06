import type { Liff } from '@line/liff';
import type { Profile } from '@/types';

export type NativeLiffProfile = Awaited<ReturnType<Liff['getProfile']>>;

export type LineTokenType = 'id' | 'access';

export type LiffContextValue = {
  liff: Liff | null;
  profile: Profile | null;
  isReady: boolean;
  isLoggedIn: boolean;
  token: string | null;
  tokenType: LineTokenType | null;
  userId: string | null;
  syncingSession: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};
