
'use client';

import { Profile } from '@/components/Profile';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SidebarInset } from '@/components/ui/sidebar';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Profile />
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
