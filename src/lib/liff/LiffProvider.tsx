"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Liff } from '@line/liff';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Profile } from "@/types";
import type { LiffContextValue, NativeLiffProfile } from './types';

/**
 * アプリ全体で共有するLIFF関連の状態と操作をカプセル化したReactコンテキスト。
 * LiffProviderを介してのみ値が提供される。
 */
const LiffContext = createContext<LiffContextValue | undefined>(undefined);

/**
 * LIFF SDKから返却される生のプロフィール情報をアプリ内部の統一フォーマットへ整形する。
 */
function normaliseProfile(nativeProfile: NativeLiffProfile): Profile {
  return {
    userId: nativeProfile.userId,
    displayName: nativeProfile.displayName,
    pictureUrl: nativeProfile.pictureUrl ?? undefined,
    statusMessage: nativeProfile.statusMessage ?? undefined,
  };
}

/**
 * LIFF SDKの初期化とログイン状態の監視を行い、取得したLINEユーザー情報を
 * NextAuthのセッションへ同期させるアプリケーション全体のプロバイダー。
 */
export function LiffProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [liffInstance, setLiffInstance] = useState<Liff | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [syncingSession, setSyncingSession] = useState(false);
  const [hasSyncedSession, setHasSyncedSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    if (initializingRef.current) {
      return;
    }

    initializingRef.current = true;

    let isMounted = true;

    async function initialize() {
      const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

      if (!liffId) {
        if (isMounted) {
          console.error('NEXT_PUBLIC_LIFF_ID is not configured.');
          setError('LINEミニアプリの設定が完了していません。管理者にお問い合わせください。');
          setIsReady(true);
        }
        return;
      }

      try {
        const { default: liff } = await import('@line/liff');

        if (!isMounted) {
          return;
        }

        await liff.init({ liffId });

        if (!isMounted) {
          return;
        }

        setLiffInstance(liff);
        const loggedIn = liff.isLoggedIn();
        setIsLoggedIn(loggedIn);

        if (loggedIn) {
          try {
            const liffProfile = await liff.getProfile();

            if (isMounted) {
              setProfile(normaliseProfile(liffProfile));
            }
          } catch (profileError) {
            console.error('Failed to load LIFF profile:', profileError);
            if (isMounted) {
              setError('LINEプロフィールの取得に失敗しました。再読み込みしてください。');
            }
          }
        }

        setIsReady(true);
      } catch (initError) {
        console.error('Failed to initialize LIFF:', initError);
        if (isMounted) {
          setError('LINEミニアプリの初期化に失敗しました。LINEアプリ内で再度開き直してください。');
          setIsReady(true);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!liffInstance) {
      return;
    }

    const currentLiff = liffInstance;

    const loggedIn = currentLiff.isLoggedIn();
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      setProfile(null);
      setHasSyncedSession(false);
      return;
    }

    let cancelled = false;

    async function loadProfile() {
      try {
        const currentProfile = await currentLiff.getProfile();
        if (!cancelled) {
          setProfile(normaliseProfile(currentProfile));
        }
      } catch (profileError) {
        console.error('Failed to refresh LIFF profile:', profileError);
        if (!cancelled) {
          setError('LINEプロフィールの取得に失敗しました。');
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [liffInstance]);

  useEffect(() => {
    if (!liffInstance || !isReady) {
      return;
    }

    const currentLiff = liffInstance;

    const loggedIn = currentLiff.isLoggedIn();
    setIsLoggedIn(loggedIn);

    if (!loggedIn) {
      setHasSyncedSession(false);
      if (sessionStatus === 'authenticated') {
        signOut({ redirect: false });
      }
      return;
    }

    if (sessionStatus === 'loading') {
      return;
    }

    if (sessionStatus === 'authenticated') {
      if (!hasSyncedSession) {
        setHasSyncedSession(true);
      }
      return;
    }

    if (syncingSession || hasSyncedSession) {
      return;
    }

    const idToken = currentLiff.getIDToken();

    if (!idToken) {
      setError('LINEのIDトークンを取得できませんでした。アプリを再度開いてください。');
      return;
    }

    const decoded = currentLiff.getDecodedIDToken();
    const currentProfile: Profile | null = profile ?? (decoded?.sub
      ? {
          userId: decoded.sub,
          displayName: decoded.name ?? 'LINE User',
          pictureUrl: decoded.picture ?? undefined,
          statusMessage: undefined,
        }
      : null);

    const userId = decoded?.sub ?? currentProfile?.userId;

    if (!userId) {
      setError('LINEユーザーIDの取得に失敗しました。再度ログインしてください。');
      return;
    }

    setSyncingSession(true);

    signIn('credentials', {
      redirect: false,
      idToken,
      userId,
      displayName: currentProfile?.displayName ?? decoded?.name ?? 'LINE User',
      pictureUrl: currentProfile?.pictureUrl ?? decoded?.picture ?? undefined,
      email: decoded?.email ?? undefined,
    })
      .then((result) => {
        if (result?.error) {
          console.error('Failed to synchronise LIFF session with NextAuth:', result.error);
          setHasSyncedSession(false);
          setError('LINEアカウントとの連携に失敗しました。アプリを再起動してください。');
        } else {
          setError(null);
          setHasSyncedSession(true);
        }
      })
      .catch((signinError) => {
        console.error('Unexpected error while signing in with LIFF token:', signinError);
        setHasSyncedSession(false);
        setError('LINEアカウントとの連携に失敗しました。しばらくしてから再試行してください。');
      })
      .finally(() => {
        setSyncingSession(false);
      });
  }, [
    liffInstance,
    isReady,
    sessionStatus,
    syncingSession,
    hasSyncedSession,
    profile,
  ]);

  /**
   * LINEアプリ側のログインフローを開始する。初期化エラー時にはメッセージを設定する。
   */
  const login = useCallback(() => {
    if (!liffInstance) {
      setError('LINEミニアプリを初期化できませんでした。ページを再読み込みしてください。');
      return;
    }

    if (!liffInstance.isLoggedIn()) {
      try {
        liffInstance.login();
      } catch (loginError) {
        console.error('Failed to trigger LIFF login:', loginError);
        setError('LINEログインの開始に失敗しました。');
      }
      return;
    }

    setError(null);
  }, [liffInstance]);

  /**
   * LIFFとNextAuth双方のセッションを破棄し、ローカル状態を初期化する。
   */
  const logout = useCallback(async () => {
    if (liffInstance?.isLoggedIn()) {
      try {
        liffInstance.logout();
      } catch (logoutError) {
        console.error('Failed to log out from LIFF:', logoutError);
      }
    }

    setIsLoggedIn(false);
    setProfile(null);
    setHasSyncedSession(false);
    setError(null);

    try {
      await signOut({ redirect: false, callbackUrl: '/' });
    } catch (signOutError) {
      console.error('Failed to sign out from NextAuth session:', signOutError);
    }
  }, [liffInstance]);

  /**
   * 現在のLINEプロフィール情報を再取得しコンテキストへ反映する。
   */
  const refreshProfile = useCallback(async () => {
    if (!liffInstance || !liffInstance.isLoggedIn()) {
      return;
    }

    try {
      const updatedProfile = await liffInstance.getProfile();
      setProfile(normaliseProfile(updatedProfile));
    } catch (profileError) {
      console.error('Failed to refresh LIFF profile:', profileError);
      setError('LINEプロフィールの更新に失敗しました。');
    }
  }, [liffInstance]);

  const value = useMemo<LiffContextValue>(() => ({
    liff: liffInstance,
    profile,
    isReady,
    isLoggedIn,
    syncingSession,
    error,
    login,
    logout,
    refreshProfile,
    session: session ?? null,
  }), [
    liffInstance,
    profile,
    isReady,
    isLoggedIn,
    syncingSession,
    error,
    login,
    logout,
    refreshProfile,
    session,
  ]);

  return <LiffContext.Provider value={value}>{children}</LiffContext.Provider>;
}

/**
 * LiffProviderが供給するLIFF操作ユーティリティと状態を取得するためのカスタムフック。
 * プロバイダー外で呼び出した場合はエラーを投げる。
 */
export function useLiff() {
  const context = useContext(LiffContext);

  if (!context) {
    throw new Error('useLiff must be used within a LiffProvider');
  }

  return context;
}
