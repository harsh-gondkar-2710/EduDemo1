
'use client';

import React, { Suspense } from 'react';
import { Certifications } from '@/components/Certifications';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

function CertificationsFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/4" />
      <Skeleton className="h-20 w-full" />
      <div className="space-y-4 mt-8">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

function CertificationsContent() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Certifications />
      </div>
    </SidebarInset>
  );
}

export default function CertificationsPage() {
  return (
    <Suspense fallback={<CertificationsFallback />}>
      <CertificationsContent />
    </Suspense>
  );
}
