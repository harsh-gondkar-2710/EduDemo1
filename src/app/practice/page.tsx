
'use client';

import { useState } from 'react';
import { PracticeSession } from '@/components/PracticeSession';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const subjects = ['General', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Indian History', 'Social Studies', 'GK'];

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  if (!selectedSubject) {
    return (
      <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Practice Session</h1>
                <p className="text-muted-foreground mt-2">Choose a subject to start practicing.</p>
            </div>
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Subject</CardTitle>
              <CardDescription>Select a subject from the options below to begin your practice session.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Button
                  key={subject}
                  variant="outline"
                  size="lg"
                  className="h-auto py-4 text-base"
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
