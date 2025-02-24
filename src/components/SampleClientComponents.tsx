'use client'

import React from 'react';
import { useTranslation } from 'react-i18next';

export default function SampleClientComponents() {
  const { t } = useTranslation("common");

  return (
    <div className="p-3 rounded-xl flex items-center justify-center w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {t("this_is_a_sample_client_component")}
    </div>
  );
}