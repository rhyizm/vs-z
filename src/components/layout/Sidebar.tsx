"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from 'js-cookie';
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeaderBrand from "./HeaderBrand";

export type SidebarItem = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

type SidebarProps = {
  sidebarItems: SidebarItem[];
  initialCollapsed?: boolean;
  locale?: string;
};

export default function Sidebar({ sidebarItems, initialCollapsed = true }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const pathname = usePathname();

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
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0
          h-screen
          transition-all duration-300 ease-in-out
          bg-background border-r border-border
          ${collapsed ? "w-16" : "w-64"}
          z-40
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo area */}
          <div
            className={`
            flex items-center justify-between h-16 px-3.5 border-b border-border
            ${collapsed ? "justify-center" : ""}
          `}
          >

            {!collapsed && (
              <HeaderBrand />
            )}

            {/* Toggle button */}
            <button
              className={`
                hidden md:flex items-center justify-center p-1.5 rounded-md
                text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                ${collapsed ? "mx-auto" : ""}
              `}
              onClick={toggleCollapsed} // Use internal toggle function
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
            <ul className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <li key={item.name}>
<Link
  href={item.href}
  className={`
    flex items-center p-2 rounded-lg group
    ${
      isActive
        ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }
    /* justify-centerを削除し、常に左寄せ */
  `}
>
                      <div
                        className={`
                        ${
                          isActive
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-gray-600 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                        }
                      `}
                      >
                        {item.icon}
                      </div>

                      {!collapsed && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div
            className={`
            py-4 px-2 border-t border-border flex flex-col
            ${collapsed ? "text-center" : "flex justify-between items-center"}
          `}
          >
            {!collapsed && (
              <div className="text-sm flex flex-col space-y-2">
                <Link
                  href="/terms/privacy-policy"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  プライバシーポリシー
                </Link>
                <Link
                  href="/terms/term-of-use"
                  className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  利用規約
                </Link>
              </div>
            )}
            {!collapsed && (
              <>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-3">{`© 2025 ${"Next.js-v15-i18n"}`}</div>
              </>
            )}
          </div>
        </div>
      </aside>
  );
}
