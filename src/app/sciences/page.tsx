'use client';

import { PracticeSession } from '@/components/PracticeSession';
import { SidebarInset } from '@/components/ui/sidebar';

export default function SciencesPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <PracticeSession subject="Sciences" />
      </div>
    </SidebarInset>
  );
}
