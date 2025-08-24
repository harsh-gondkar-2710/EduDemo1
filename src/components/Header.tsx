
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Book, Bot, Target, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Target },
    { href: '/practice', label: 'Practice', icon: Book },
    { href: '/tutor', label: 'AI Tutor', icon: Bot },
    { href: '/language', label: 'Language', icon: Languages },
  ];

  return (
    <>
      <header className="bg-card shadow-sm sticky top-0 z-50 flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden" />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AdaptiLearn</span>
          </Link>
        </div>
      </header>
      <Sidebar side="left" collapsible="offcanvas" className="border-r">
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} className='w-full'>
                    <SidebarMenuButton
                    isActive={pathname === item.href}
                    >
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
      </Sidebar>
    </>
  );
}
