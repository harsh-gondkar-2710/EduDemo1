
'use client';

import { AITutor } from '@/components/AITutor';
import { SidebarInset } from '@/components/ui/sidebar';

export default function TutorPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <AITutor />
      </div>
    </SidebarInset>
  );
}
