
'use client';

import { Profile } from '@/components/Profile';
import { SidebarInset } from '@/components/ui/sidebar';

export default function ProfilePage() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6 flex justify-end">
        <div className="w-full max-w-2xl">
            <Profile />
        </div>
      </div>
    </SidebarInset>
  );
}
