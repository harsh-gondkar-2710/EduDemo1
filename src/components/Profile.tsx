
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePerformance } from '@/hooks/use-performance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from './ui/skeleton';

export function Profile() {
  const { user, loading: authLoading, updateUserProfile } = useAuth();
  const { age, setAge, loading: perfLoading } = usePerformance();
  const [displayName, setDisplayName] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
    if (age !== null) {
      setAgeInput(age.toString());
    }
  }, [user, age]);

  const handleSaveChanges = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Update display name if it has changed
      if (displayName !== user.displayName) {
        await updateUserProfile({ displayName });
      }

      // Update age if it has changed
      const newAge = parseInt(ageInput, 10);
      if (!isNaN(newAge) && newAge > 0 && newAge !== age) {
        setAge(newAge);
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });

    } catch (error) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Error',
        description: 'Could not save your changes. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const isLoading = authLoading || perfLoading;

  if (isLoading) {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
                <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your personal details and settings.</p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSaveChanges}>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your display name and age.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
