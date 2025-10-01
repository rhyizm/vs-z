import type { Liff } from '@line/liff';
import type { Session } from 'next-auth';
import type { Profile } from "@/types";

export type NativeLiffProfile = Awaited<ReturnType<Liff['getProfile']>>;

export type LiffContextValue = {
  liff: Liff | null;
  profile: Profile | null;
  isReady: boolean;
  isLoggedIn: boolean;
  syncingSession: boolean;
  error: string | null;
  login: () => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  session: Session | null;
};
