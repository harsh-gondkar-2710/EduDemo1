
'use client';

import { useState } from 'react';
import { PracticeSession } from '@/components/PracticeSession';
import { SidebarInset } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const subjects = ['Random', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Indian History', 'Social Studies', 'GK', 'Other'];

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherTopic, setOtherTopic] = useState('');

  const handleSubjectClick = (subject: string) => {
    if (subject === 'Other') {
      setShowOtherInput(true);
    } else {
      setSelectedSubject(subject);
    }
  };

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otherTopic.trim()) {
      setSelectedSubject(otherTopic.trim());
    }
  };

  if (!selectedSubject) {
    return (
      <SidebarInset>
        <div className="container mx-auto px-4 py-8 md:px-6">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold">Practice Session</h1>
                <p className="text-muted-foreground mt-2">Choose a subject to start practicing.</p>
            </div>
            
            {!showOtherInput ? (
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
                        onClick={() => handleSubjectClick(subject)}
                        >
                        {subject}
                        </Button>
                    ))}
                    </CardContent>
                </Card>
            ) : (
                <Card className="max-w-3xl mx-auto">
                    <form onSubmit={handleOtherSubmit}>
                        <CardHeader>
                            <CardTitle>Enter Custom Topic</CardTitle>
                            <CardDescription>What topic would you like to practice today?</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Input 
                                value={otherTopic}
                                onChange={(e) => setOtherTopic(e.target.value)}
                                placeholder="e.g., 'Linear Algebra' or 'World War II'"
                            />
                        </CardContent>
                        <CardFooter className="gap-4">
                             <Button type="button" variant="outline" onClick={() => setShowOtherInput(false)}>Back</Button>
                             <Button type="submit" disabled={!otherTopic.trim()}>Start Practice</Button>
                        </CardFooter>
                    </form>
                </Card>
            )}
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
