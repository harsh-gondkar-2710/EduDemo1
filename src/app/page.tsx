
'use client';

import { Dashboard } from "@/components/Dashboard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarInset } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <ProtectedRoute>
      <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Dashboard />
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
