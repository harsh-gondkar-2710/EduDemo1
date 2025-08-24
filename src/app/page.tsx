
'use client';

import { Dashboard } from "@/components/Dashboard";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <Dashboard />
      </div>
    </SidebarInset>
  );
}
