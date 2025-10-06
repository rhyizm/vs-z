"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Liff } from '@line/liff';
import { Profile } from '@/types';
import type { LiffContextValue, LineTokenType, NativeLiffProfile } from './types';

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
 * アプリケーション全体へ提供するプロバイダー。
 */
export function LiffProvider({ children }: { children: React.ReactNode }) {
  const [liffInstance, setLiffInstance] = useState<Liff | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [tokenType, setTokenType] = useState<LineTokenType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [syncingSession, setSyncingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializingRef = useRef(false);
  const isMountedRef = useRef(true);
  const profileRef = useRef<Profile | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

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
          setError(JSON.stringify(initError));
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
      setToken(null);
      setTokenType(null);
      setUserId(null);
      setSyncingSession(false);
      syncingRef.current = false;
      return;
    }

    if (token || syncingRef.current) {
      return;
    }

    const synchroniseToken = async () => {
      syncingRef.current = true;
      setSyncingSession(true);

      try {
        const idTokenFromLiff = currentLiff.getIDToken();
        const accessTokenFromLiff = currentLiff.getAccessToken?.() ?? null;

        let resolvedToken = idTokenFromLiff;
        let resolvedTokenType: LineTokenType = 'id';

        if (!resolvedToken) {
          if (!accessTokenFromLiff) {
            throw new Error('LINEの認証トークンを取得できませんでした。');
          }

          resolvedToken = accessTokenFromLiff;
          resolvedTokenType = 'access';
        }

        const existingProfile = profileRef.current;
        let resolvedProfile = existingProfile;

        if (!resolvedProfile) {
          const latestProfile = await currentLiff.getProfile();
          resolvedProfile = normaliseProfile(latestProfile);
        }

        if (!resolvedProfile?.userId) {
          throw new Error('LINEユーザーIDの取得に失敗しました。');
        }

        const accessTokenForSync =
          resolvedTokenType === 'access' ? resolvedToken : accessTokenFromLiff ?? undefined;

        const response = await fetch('/api/line/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenType: resolvedTokenType,
            idToken: resolvedTokenType === 'id' ? resolvedToken : undefined,
            accessToken: accessTokenForSync,
          }),
        });

        if (!response.ok) {
          let message = 'LINEアカウントとの連携に失敗しました。しばらくしてから再試行してください。';

          try {
            const data = (await response.json()) as { error?: string };
            if (data?.error) {
              message = data.error;
            }
          } catch {
            // ignore parse errors
          }

          throw new Error(message);
        }

        if (isMountedRef.current) {
          setError(null);
          setToken(resolvedToken);
          setTokenType(resolvedTokenType);
          setUserId(resolvedProfile.userId);

          if (!existingProfile) {
            setProfile(resolvedProfile);
          }
        }
      } catch (tokenError) {
        console.error('Failed to synchronise LIFF token:', tokenError);

        if (isMountedRef.current) {
          setError('LINEアカウントとの連携に失敗しました。しばらくしてから再試行してください。');
          setToken(null);
          setTokenType(null);
          setUserId(null);
        }
      } finally {
        syncingRef.current = false;

        if (isMountedRef.current) {
          setSyncingSession(false);
        }
      }
    };

    void synchroniseToken();
  }, [liffInstance, isReady, profile, token]);

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
 * LIFFのセッションを破棄し、ローカル状態を初期化する。
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
    setToken(null);
    setTokenType(null);
    setUserId(null);
    setSyncingSession(false);
    setError(null);
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
    token,
    tokenType,
    userId,
    syncingSession,
    error,
    login,
    logout,
    refreshProfile,
  }), [
    liffInstance,
    profile,
    isReady,
    isLoggedIn,
    token,
    tokenType,
    userId,
    syncingSession,
    error,
    login,
    logout,
    refreshProfile,
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
