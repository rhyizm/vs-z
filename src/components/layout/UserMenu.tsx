'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import type { AuthChangeEvent } from '@supabase/supabase-js';

interface UserMenuProps {
  settingsText: string;
  logoutText: string;
}

export default function UserMenu({ settingsText, logoutText }: UserMenuProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const iconButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

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

  // Session change monitoring
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session) => {
        setSession(session);
        if (event === 'SIGNED_IN') {
          const redirectTo = new URL(window.location.href).searchParams.get('redirectTo') || '/';
          router.replace(redirectTo);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // Session retrieval on mount and path change
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
  }, [supabase, pathname]); // Re-fetch session when path changes

  if (!session?.user) {
    return null;
  }

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push(`/`);
  };

  return (
    <>
      <div className="flex items-center space-x-2 mr-4 relative" ref={dropdownRef}>
        <div className="relative">
          <button
            ref={iconButtonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            {session.user.user_metadata?.avatar_url || session.user.user_metadata?.image ? (
              <img
                src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.image}
                alt={session.user.user_metadata?.name || 'User'}
                className="h-full w-full object-cover"
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
                {(session.user.user_metadata?.avatar_url || session.user.user_metadata?.image) && (
                  <img
                    src={session.user.user_metadata?.avatar_url || session.user.user_metadata?.image}
                    alt={session.user.user_metadata?.name || 'User'}
                    className="h-6 w-6 rounded-full mr-2 object-cover"
                  />
                )}
                <span className="truncate">{session.user.user_metadata?.name || 'User'}</span>
              </div>
              <Link
                href={`/settings`}
                onClick={() => { setIsDropdownOpen(false); if (pathname !== `/settings`) setLoading(true); }}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {settingsText}
              </Link>
              <button
                onClick={() => { setIsDropdownOpen(false); signOut(); }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {logoutText}
              </button>
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500"></div>
        </div>
      )}
    </>
  );
}
