import type { ReactNode } from "react";

type WrapperProps = {
  children: ReactNode;
  className?: string;
};

export default function Wrapper({ children, className }: WrapperProps) {
  return (
    <div className={`flex h-screen ${className || ""}`}>
      {children}
    </div>
  );
}
