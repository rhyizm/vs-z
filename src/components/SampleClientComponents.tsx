'use client';

import React from 'react';
// Removed react-i18next import
import { useTranslations } from 'next-intl'; // Import useTranslations from next-intl

export default function SampleClientComponents() {
  // Use useTranslations hook from next-intl
  // No namespace needed if keys are loaded globally (default)
  const t = useTranslations('common');

  return (
    <div className="p-3 rounded-xl flex items-center justify-center w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Key remains the same */}
      {t('this_is_a_sample_client_component')}
    </div>
  );
}
