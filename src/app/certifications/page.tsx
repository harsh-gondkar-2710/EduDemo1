
'use client';

import { Certifications } from '@/components/Certifications';
import { SidebarInset } from '@/components/ui/sidebar';

export default function CertificationsPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Certifications />
      </div>
    </SidebarInset>
  );
}
