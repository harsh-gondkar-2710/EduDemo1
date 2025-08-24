
'use client';

import { useState } from 'react';
import { PracticeSession } from '@/components/PracticeSession';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const scienceSubjects = ['Physics', 'Chemistry', 'Biology'];

export default function SciencesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (!selectedSubject) {
    return (
      <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Science Topic</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scienceSubjects.map((subject) => (
                <Button
                  key={subject}
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    );
  }

  return (
    <SidebarInset>
      <div className="container mx-auto px-4 py-8 md:px-6">
        <PracticeSession
          subject={selectedSubject}
          onBack={() => setSelectedSubject(null)}
        />
      </div>
    </SidebarInset>
  );
}
