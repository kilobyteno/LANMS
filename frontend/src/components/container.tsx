import { type ReactNode } from 'react';

export function Container({ children }: { children: ReactNode }) {
  return <div className="container mx-auto px-4 py-6">{children}</div>;
} 