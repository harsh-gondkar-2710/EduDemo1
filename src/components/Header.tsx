
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';

export function Header() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/practice', label: 'Practice' },
  ];

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BrainCircuit className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">AdaptiLearn</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium">
          {user && !loading && (
            <>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors hover:text-primary hidden md:block',
                    pathname === item.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Button variant="ghost" size="icon" onClick={logout} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
          {!user && !loading && (
             <div className="flex items-center gap-2">
               <Button asChild variant="ghost">
                 <Link href="/login">Login</Link>
               </Button>
               <Button asChild>
                 <Link href="/signup">Sign Up</Link>
               </Button>
             </div>
          )}
        </nav>
      </div>
    </header>
  );
}
