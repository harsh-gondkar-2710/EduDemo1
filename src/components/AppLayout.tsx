
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './ui/sidebar';
import { Header } from './Header';
import { cn } from '@/lib/utils';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="relative flex min-h-screen">
      {!isLoginPage && (
        <Sidebar side="left" collapsible="icon" className="border-r hidden md:flex">
          <Header />
        </Sidebar>
      )}
      <main className={cn(
        "flex-1 flex flex-col",
        isLoginPage && "items-end justify-center pr-16"
      )}>
        {!isLoginPage && (
            <div className="md:hidden">
                <Header />
            </div>
        )}
        {children}
      </main>
    </div>
  );
}
