
'use client';

import { PerformanceProvider } from '@/hooks/use-performance';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <SidebarProvider>
          <PerformanceProvider>{children}</PerformanceProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
