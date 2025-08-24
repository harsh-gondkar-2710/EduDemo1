'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adjustDifficulty } from '@/ai/flows/dynamically-adjust-difficulty';
import type { MathQuestion, Operation } from '@/lib/math';
import { generateQuestion } from '@/lib/math';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformance } from '@/hooks/use-performance';
import { useRouter } from 'next/navigation';

const TOTAL_QUESTIONS = 10;

type PerformanceRecord = {
  question: string;
  correct: boolean;
  timeTaken: number;
  operation: Operation;
};

export function PracticeSession() {
  const [difficulty, setDifficulty] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSessionOver, setIsSessionOver] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const { addSessionData } = usePerformance();
  const router = useRouter();
  
  const startNewQuestion = (newDifficulty: number) => {
    setIsLoading(true);
    setCurrentQuestion(generateQuestion(newDifficulty));
    setStartTime(Date.now());
    setIsLoading(false);
  }

  useEffect(() => {
    startNewQuestion(difficulty);
  }, []);

  useEffect(() => {
    if (isSessionOver) {
        addSessionData({
            score: (correctAnswers / TOTAL_QUESTIONS) * 100,
            performanceHistory
        });
        // Redirect to dashboard or show summary
    }
  }, [isSessionOver, correctAnswers, performanceHistory, addSessionData]);

  const progressPercentage = useMemo(() => (questionsAnswered / TOTAL_QUESTIONS) * 100, [questionsAnswered]);

  const handleNextQuestion = async () => {
    setFeedback(null);
    setUserAnswer('');
    
    if (questionsAnswered + 1 >= TOTAL_QUESTIONS) {
      setQuestionsAnswered(prev => prev + 1);
      setIsSessionOver(true);
      return;
    }

    setQuestionsAnswered(prev => prev + 1);

    if (performanceHistory.length > 0) {
      setIsLoading(true);
      try {
        const response = await adjustDifficulty({
          studentId: 'student-123',
          currentDifficulty: difficulty,
          performanceData: JSON.stringify(performanceHistory.slice(-5)),
        });
        setDifficulty(response.newDifficulty);
        startNewQuestion(response.newDifficulty);
        toast({
          title: "Difficulty Adjusted!",
          description: `New level: ${response.newDifficulty}. ${response.reasoning}`,
        });
      } catch (error) {
        console.error('Error adjusting difficulty:', error);
        toast({
          variant: 'destructive',
          title: 'AI Error',
          description: 'Could not adjust difficulty. Continuing at current level.',
        });
        startNewQuestion(difficulty);
      } finally {
        setIsLoading(false);
      }
    } else {
        startNewQuestion(difficulty);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (feedback || !currentQuestion) return;

    const answer = parseInt(userAnswer, 10);
    const isCorrect = answer === currentQuestion.answer;

    const timeTaken = (Date.now() - startTime) / 1000;
    setPerformanceHistory(prev => [
      ...prev,
      { question: currentQuestion.questionText, correct: isCorrect, timeTaken, operation: currentQuestion.operation },
    ]);

    if (isCorrect) {
      setFeedback({ type: 'correct', message: 'Great job! That is correct.' });
      setCorrectAnswers(prev => prev + 1);
    } else {
      setFeedback({
        type: 'incorrect',
        message: `Not quite. The correct answer is ${currentQuestion.answer}.`,
      });
    }
  };

  const restartSession = () => {
    router.push('/');
  };

  if (isSessionOver) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Session Complete!</CardTitle>
          <CardDescription>
            You've completed {TOTAL_QUESTIONS} questions. Here's how you did.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">
            Final Score: <strong>{correctAnswers} / {TOTAL_QUESTIONS}</strong>
          </p>
          <p>Your final difficulty level was: <strong>{difficulty}</strong></p>
          <p className="text-sm text-muted-foreground">Your dashboard has been updated with your latest progress.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={restartSession}>Back to Dashboard</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Practice Session</CardTitle>
        <CardDescription className="text-center">
          Question {questionsAnswered + 1} of {TOTAL_QUESTIONS}
        </CardDescription>
        <Progress value={progressPercentage} className="w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-6 min-h-[250px]">
        {isLoading || !currentQuestion ? (
          <div className="space-y-4 text-center pt-8">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-1/2 mx-auto" />
          </div>
        ) : (
          <>
            <div className="text-center pt-8">
              <p className="text-3xl font-semibold text-primary">{currentQuestion.questionText}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer"
                className="text-lg"
                disabled={!!feedback}
                required
              />
              <Button type="submit" disabled={!!feedback}>
                Submit
              </Button>
            </form>
            {feedback && (
              <Alert variant={feedback.type === 'correct' ? 'default' : 'destructive'}>
                {feedback.type === 'correct' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>
                  {feedback.type === 'correct' ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription>
                  {feedback.message}
                  {feedback.type === 'incorrect' && (
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-accent" />
                      <span>Try to think about the operation being used.</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleNextQuestion}
          className="w-full"
          disabled={!feedback || isLoading}
          variant="secondary"
        >
          {isLoading ? "Adjusting difficulty..." : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  );
}
