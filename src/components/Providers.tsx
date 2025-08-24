
'use client';

import { PerformanceProvider } from '@/hooks/use-performance';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <PerformanceProvider>{children}</PerformanceProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
