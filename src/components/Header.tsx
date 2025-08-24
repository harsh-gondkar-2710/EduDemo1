
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Book, Bot, Target, Languages, PenSquare, FlaskConical, Calculator } from 'lucide-react';
import { Sidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger } from '@/components/ui/sidebar';

export function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Target },
    { href: '/tutor', label: 'AI Tutor', icon: Bot },
    { href: '/language', label: 'Language', icon: Languages },
    { href: '/essay-grading', label: 'Essay Grading', icon: PenSquare },
    { href: '/sciences', label: 'Sciences Practice', icon: FlaskConical },
    { href: '/maths', label: 'Maths Practice', icon: Calculator },
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
