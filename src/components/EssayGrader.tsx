'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { gradeEssay, type EssayFeedback } from '@/ai/flows/grade-essay';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { PenSquare, Check, X } from 'lucide-react';

export function EssayGrader() {
  const [essayText, setEssayText] = useState('');
  const [feedback, setFeedback] = useState<EssayFeedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGradeEssay = async (e: FormEvent) => {
    e.preventDefault();
    if (!essayText) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const result = await gradeEssay({ essayText });
      setFeedback(result);
    } catch (error) {
      console.error('Failed to grade essay:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not grade the essay at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">AI Essay Grader</h1>
        <p className="text-muted-foreground mt-2">Get instant feedback on your writing. Paste your essay below to get started.</p>
      </div>
      
      <Card>
        <form onSubmit={handleGradeEssay}>
          <CardHeader>
            <CardTitle>Your Essay</CardTitle>
            <CardDescription>Enter the text of your essay to be graded.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Paste your essay here..."
              className="min-h-[300px]"
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !essayText}>
              {isLoading ? 'Grading...' : 'Grade My Essay'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-5/6" />
            </CardContent>
         </Card>
      )}

      {feedback && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PenSquare className="text-primary"/>
                    Feedback
                </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
                <h3 className="text-xl font-semibold">Overall Score: {feedback.overallScore}/100</h3>
                <p>{feedback.overallFeedback}</p>
                
                <div className="mt-6">
                    <h4 className="text-lg font-semibold">Strengths:</h4>
                    <ul className="list-disc pl-5">
                        {feedback.strengths.map((strength, index) => (
                           <li key={index} className="flex items-start gap-2 text-green-700 dark:text-green-400">
                                <Check className="h-5 w-5 mt-1 shrink-0"/>
                                <span>{strength}</span>
                           </li> 
                        ))}
                    </ul>
                </div>

                <div className="mt-4">
                    <h4 className="text-lg font-semibold">Areas for Improvement:</h4>
                    <ul className="list-disc pl-5">
                        {feedback.areasForImprovement.map((area, index) => (
                            <li key={index} className="flex items-start gap-2 text-red-700 dark:text-red-400">
                                <X className="h-5 w-5 mt-1 shrink-0" />
                                <span>{area}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
