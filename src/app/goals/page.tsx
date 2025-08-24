'use client';

import { StudyGoals } from '@/components/StudyGoals';
import { SidebarInset } from '@/components/ui/sidebar';

export default function StudyGoalsPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <StudyGoals />
      </div>
    </SidebarInset>
  );
}
