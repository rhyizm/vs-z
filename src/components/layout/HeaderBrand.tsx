"use client";

import React from 'react';

interface HeaderBrandProps {
  mobileOnly?: boolean;
  text?: string;
  textSize?: string;
}

const HeaderBrand: React.FC<HeaderBrandProps> = ({ text, mobileOnly = false, textSize = 'text-xl' }) => {
  if (!text) {
    return null;
  }

  return (
    <div className={`${textSize} font-bold whitespace-nowrap bg-clip-text text-transparent bg-gradient_indigo-500_sky-500_emerald-500 ${mobileOnly ? 'md:hidden' : ''}`}>
      {text}
    </div>
  );
};

export default HeaderBrand;
