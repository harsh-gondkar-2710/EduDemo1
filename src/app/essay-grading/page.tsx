'use client';

import { EssayGrader } from '@/components/EssayGrader';
import { SidebarInset } from '@/components/ui/sidebar';

export default function EssayGradingPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <EssayGrader />
      </div>
    </SidebarInset>
  );
}
