import React from 'react';
import { Coins } from 'lucide-react'; // Import an icon for credits
import HeaderBrand from './HeaderBrand';
import LanguageSelector from "@/components/i18n/LanguageSelector";
import { ThemeToggle } from "@/components/theme/ThemeToggle";


interface HeaderProps {
  credits?: number;
}

const Header: React.FC<HeaderProps> = ({ credits }) => {
  return (
    <header className="sticky top-0 z-30 bg-background border-b border-border px-4 py-2">
      <div className="container mx-auto flex justify-start items-center">
        <HeaderBrand mobileOnly={true} text='Next.js v15 i18n' />
        <div className="flex flex-grow items-center space-x-2 ml-2">
        </div>
        {/* Display Credits before User Profile */}
        {credits && (
          <div className="flex items-center space-x-2 mr-4 text-md text-gray-600 dark:text-gray-300">
            <Coins className="h-4 w-4" />
            <span>{credits}</span>
          </div>
        )}
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default Header;
