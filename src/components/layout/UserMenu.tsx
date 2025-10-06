'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLiff } from '@/lib/liff';

export default function UserMenu() {
  const t = useTranslations();
  const {
    login,
    logout,
    isReady,
    isLoggedIn,
    syncingSession,
    error,
    profile,
  } = useLiff();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  // Close dropdown when clicking outside menu and icon button
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        iconButtonRef.current &&
        !iconButtonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!syncingSession) {
      setLoading(false);
    }
  }, [syncingSession]);

  if (!isReady) {
    return null; // Or a loading spinner
  }

  if (!isLoggedIn || !profile) {
    return (
      <div className="flex flex-col items-end space-y-2">
        {error && (
          <span className="text-xs text-red-500 dark:text-red-400 max-w-[200px] text-right">
            {error}
          </span>
        )}
        <button
          onClick={login}
          disabled={syncingSession}
          className="bg-[#06c755] text-white rounded-full font-medium text-sm h-10 px-5 cursor-pointer disabled:opacity-50"
        >
          {syncingSession ? t('auth.syncing') : t('auth.lineLoginButton')}
        </button>
      </div>
    );
  }

  const handleSignOut = async () => {
    setLoading(true);
    await logout();
    router.push('/');
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center space-x-2 mr-4 relative" ref={dropdownRef}>
        <div className="relative">
          <button
            ref={iconButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {profile.pictureUrl ? (
              <Image
                src={profile.pictureUrl}
                alt={profile.displayName || t('common.user')}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
              <div className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                {profile.pictureUrl && (
                  <div className="relative h-6 w-6 mr-2">
                    <Image
                      src={profile.pictureUrl}
                      alt={profile.displayName || t('common.user')}
                      fill
                      sizes="24px"
                      className="rounded-full object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <span className="truncate">{profile.displayName || t('common.user')}</span>
              </div>
              <Link
                href="/settings"
                onClick={() => { setIsDropdownOpen(false); if (pathname !== '/settings') setLoading(true); }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('common.settings')}
              </Link>
              <button
                onClick={() => { setIsDropdownOpen(false); handleSignOut(); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {t('auth.signOut')}
              </button>
            </div>
          )}
        </div>
      </div>
      {(loading || syncingSession) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      )}
    </>
  );
}
