"use client";

import type React from "react";

type ContentProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Content({
  children,
  className,
}: ContentProps) {
  return (
    <div className={`w-full h-screen overflow-y-auto ${className || ''}`}>
      {children}
    </div>
  );
}
