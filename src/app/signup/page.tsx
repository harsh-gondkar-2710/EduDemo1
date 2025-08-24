
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { FirebaseError } from 'firebase/app';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

   if (user) {
    router.push('/');
    return null;
  }

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(auth, email, password);
      router.push('/');
    } catch (error) {
       if (error instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Signup Failed',
          description: error.message,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'An unknown error occurred',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Need to import auth from firebase to use in login function
  const { auth } = require('@/lib/firebase');

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your email and password to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="underline hover:text-primary">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
