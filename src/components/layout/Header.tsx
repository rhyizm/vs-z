"use client";

import React from 'react';
import { Coins, Menu } from 'lucide-react';
import HeaderBrand from './HeaderBrand';
import LanguageSelector from "@/components/i18n/LanguageSelector";
import ThemeToggle from "@/components/theme/ThemeToggle";
import UserMenu from './UserMenu';
import { useMobileSidebar } from './MobileSidebarContext';

interface HeaderProps {
  credits?: number;
}

const Header: React.FC<HeaderProps> = ({ credits }) => {
  const { toggle } = useMobileSidebar();

  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-2">
      <div className="container mx-auto w-full max-w-full min-w-0 flex justify-start items-center">
        <button
          onClick={toggle}
          className="md:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 mr-2"
          aria-label="Toggle mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <HeaderBrand mobileOnly={true} text='Next.js v15 i18n' />
        <div className="flex flex-grow items-center space-x-2 ml-2 min-w-0">
        </div>
        {/* Display Credits before User Profile */}
        {credits && (
          <div className="flex items-center space-x-2 mr-2 sm:mr-4 text-md text-gray-600 dark:text-gray-300">
            <Coins className="h-4 w-4" />
            <span>{credits}</span>
          </div>
        )}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
        <div className="ml-3 sm:ml-5">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
