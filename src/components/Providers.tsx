
'use client';

import { PerformanceProvider } from '@/hooks/use-performance';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <PerformanceProvider>{children}</PerformanceProvider>
    </SidebarProvider>
  );
}
