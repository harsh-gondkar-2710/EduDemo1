'use client';

import { CareerMapper } from '@/components/CareerMapper';
import { SidebarInset } from '@/components/ui/sidebar';

export default function CareerPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <CareerMapper />
      </div>
    </SidebarInset>
  );
}
