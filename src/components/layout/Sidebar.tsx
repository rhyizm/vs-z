"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import HeaderBrand from "./HeaderBrand";
import { useMobileSidebar } from './MobileSidebarContext';

export type SidebarItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  sidebarItems: SidebarItem[];
  initialCollapsed?: boolean;
};

export default function Sidebar({ sidebarItems, initialCollapsed = true }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const t = useTranslations('common');
  const { isOpen, close } = useMobileSidebar();

  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);

    localStorage.setItem('sidebarCollapsed', String(newState));
    Cookies.set('sidebarCollapsed', String(newState), { expires: 365 });
  };

  useEffect(() => {
    const sidebarWidth = collapsed ? '4rem' : '16rem';
    document.documentElement.style.setProperty('--sidebar-width', sidebarWidth);
  }, [collapsed]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          flex flex-col flex-shrink-0
          h-screen
          transition-all duration-300 ease-in-out
          border-r border-border
          bg-background dark:bg-neutral-900
          ${collapsed && !isOpen ? "w-16" : "w-64"}
          z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          md:flex
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div className="relative flex items-center h-16 px-3.5 border-b border-border bg-background dark:bg-neutral-900">
            {/* Desktop toggle button - Always positioned at the left */}
            <button
              className="hidden md:flex items-center justify-center p-1.5 rounded-md text-muted-foreground hover:bg-accent absolute left-3.5"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>

            {/* Logo - Centered when collapsed, offset when expanded */}
            <div className={`flex-1 flex ${collapsed && !isOpen ? "justify-center" : "justify-center md:ml-8"}`}>
              {(!collapsed || isOpen) && (
                <HeaderBrand />
              )}
            </div>

            {/* Mobile close button */}
            <button
              className="md:hidden p-1.5 rounded-md text-muted-foreground hover:bg-accent absolute right-3.5"
              onClick={close}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className="flex items-center p-2 rounded-lg group transition-colors duration-200 hover:bg-accent"
                    >
                      <div>
                        {item.icon}
                      </div>

                      <span className={`w-0 m-0 whitespace-nowrap transition-opacity duration-300 ${collapsed && !isOpen ? 'opacity-0 invisible' : 'opacity-100 ml-3'}`}>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div
            className={`
              py-4 px-2 border-t border-border flex flex-col overflow-hidden bg-background dark:bg-neutral-900
              ${collapsed && !isOpen ? "text-center" : "flex justify-between items-center"}
            `}
          >
            <div className={`text-sm flex flex-col space-y-3 ${collapsed && !isOpen ? 'hidden' : ''}`}>
              <Link
                href="/terms/privacy-policy"
                className="text-muted-foreground hover:text-primary whitespace-nowrap"
              >
                {t('privacyPolicy')} {/* Key relative to 'sidebar' namespace */}
              </Link>
              <Link
                href="/terms/term-of-use" // Note: Consider making this path locale-aware if needed
                className="text-muted-foreground hover:text-primary whitespace-nowrap"
              >
                {t('termsOfUse')} {/* Key relative to 'sidebar' namespace */}
              </Link>
              <div className="text-sm text-muted-foreground mt-3 whitespace-nowrap">{`© 2025 ${"Next.js-v15-i18n"}`}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
