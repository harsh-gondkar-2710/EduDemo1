
'use client';

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, Target, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
        router.push('/');
        }
    }, [user, loading, router]);
    
    if (loading || user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <BrainCircuit className="h-16 w-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Welcome to AdaptiLearn</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Your personal AI-powered math tutor. Master concepts at your own pace with adaptive questions and personalized feedback.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/signup">Get Started for Free</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
      
      <div className="mt-20 grid gap-8 md:grid-cols-3">
        <Card>
          <CardHeader>
              <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                      <Target className="h-8 w-8 text-primary" />
                  </div>
              </div>
            <CardTitle className="text-center">Adaptive Learning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Our AI adjusts the difficulty of questions based on your performance, ensuring you're always challenged but never overwhelmed.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
             <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                      <Zap className="h-8 w-8 text-primary" />
                  </div>
              </div>
            <CardTitle className="text-center">Instant Feedback</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Get immediate feedback on your answers and helpful hints when you're stuck to accelerate your learning.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
             <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                      <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
              </div>
            <CardTitle className="text-center">Track Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-muted-foreground">Visualize your growth and identify areas for improvement with our comprehensive progress dashboard.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
