
'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './ui/sidebar';
import { Header } from './Header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  if (isLoginPage) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  return (
    <div className="relative flex min-h-screen">
        <Sidebar side="left" collapsible="icon" className="border-r hidden md:flex">
          <Header />
        </Sidebar>
      <main className="flex-1 flex flex-col">
            <div className="md:hidden">
                <Header />
            </div>
        {children}
      </main>
    </div>
  );
}
