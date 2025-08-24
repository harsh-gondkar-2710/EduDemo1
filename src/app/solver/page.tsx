
'use client';

import { Solver } from '@/components/Solver';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SolverPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Solver />
      </div>
    </SidebarInset>
  );
}
