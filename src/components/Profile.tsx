
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { updateProfile } from 'firebase/auth';
import { User as UserIcon, Edit } from 'lucide-react';

export function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      // Custom user data like age would typically be stored in a database (e.g., Firestore)
      // For this example, we'll try to retrieve it from a local source if available
      // or just leave it blank. In a real app, you'd fetch this from your backend.
      const storedAge = localStorage.getItem(`user_age_${user.uid}`);
      setAge(storedAge || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      await updateProfile(user, { displayName });
      // In a real app, you would also save the age to your database.
      // Here, we'll just save it to localStorage for persistence in this demo.
      if (typeof age === 'number' && age > 0) {
        localStorage.setItem(`user_age_${user.uid}`, String(age));
      }

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast({
        variant: 'destructive',
        title: 'Update Error',
        description: error.message || 'Could not update your profile.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loading Profile...</CardTitle>
                <CardDescription>Please wait while we fetch your details.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <UserIcon className="h-10 w-10 text-primary" />
            Your Profile
        </h1>
        <p className="text-muted-foreground mt-2">View and update your personal information.</p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleProfileUpdate}>
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
                <CardDescription>Make changes to your display name and age.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={user.email || ''} disabled />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                        id="displayName"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        disabled={isLoading}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value ? parseInt(e.target.value, 10) : '')}
                        disabled={isLoading}
                    />
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" disabled={isLoading}>
                    <Edit className="mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
