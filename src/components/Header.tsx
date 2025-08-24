
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, Bot, Target, Languages, PenSquare, ScanSearch, PencilRuler, Map, Goal } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';

export function Header() {
  const pathname = usePathname();
  const { state } = useSidebar();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Target },
    { href: '/tutor', label: 'Personalised Tutor', icon: Bot },
    { href: '/solver', label: 'Solver', icon: ScanSearch },
    { href: '/language', label: 'Language', icon: Languages },
    { href: '/essay-grading', label: 'Essay Grading', icon: PenSquare },
    { href: '/practice', label: 'Practice', icon: PencilRuler },
    { href: '/career', label: 'Career Mapper', icon: Map },
    { href: '/goals', label: 'Study Goals', icon: Goal },
  ];

  return (
    <>
      <header className="bg-card shadow-sm sticky top-0 z-10 flex h-16 items-center justify-between px-4 md:px-6 w-full shrink-0">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className={`text-lg font-bold ${state === 'collapsed' && 'md:hidden'}`}>AdaptiLearn</span>
          </Link>
        </div>
      </header>
      <div className='flex-1 overflow-y-auto'>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className='w-full'>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                  >
                    <item.icon />
                    <span className={`${state === 'collapsed' && 'md:hidden'}`}>{item.label}</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </>
  );
}
