
'use client';

import React, { Suspense } from 'react';
import { Certifications } from '@/components/Certifications';
import { SidebarInset } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

function CertificationsFallback() {
  return (
    <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6 space-y-8">
            <div className="space-y-4 text-center">
                <Skeleton className="h-10 w-1/2 mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
            </div>
            <Skeleton className="h-20 w-full" />
            <div className="space-y-4 mt-8">
                <h2 className="text-2xl font-bold mb-4">
                    <Skeleton className="h-8 w-1/4" />
                </h2>
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    </SidebarInset>
  );
}

export default function CertificationsPage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Suspense fallback={<CertificationsFallback />}>
          <Certifications />
        </Suspense>
      </div>
    </SidebarInset>
  );
}
