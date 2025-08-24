'use client';

import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lightbulb, BookCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adjustDifficulty } from '@/ai/flows/dynamically-adjust-difficulty';
import { generatePracticeQuestion, type PracticeQuestion } from '@/ai/flows/generate-practice-question';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformance } from '@/hooks/use-performance';
import { useRouter } from 'next/navigation';

const TOTAL_QUESTIONS = 10;

type PerformanceRecord = {
  question: string;
  correct: boolean;
  timeTaken: number;
  subject: string;
};

interface PracticeSessionProps {
    subject: string;
}

export function PracticeSession({ subject }: PracticeSessionProps) {
  const [difficulty, setDifficulty] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSessionOver, setIsSessionOver] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addSessionData } = usePerformance();
  const router = useRouter();
  
  const startNewQuestion = async (newDifficulty: number, prevQuestions: string[]) => {
    if (!subject) return;
    setIsLoading(true);
    setFeedback(null);
    setUserAnswer('');
    try {
        const question = await generatePracticeQuestion({ 
            subject, 
            difficulty: newDifficulty,
            previousQuestions: prevQuestions,
        });
        setCurrentQuestion(question);
        setAskedQuestions(prev => [...prev, question.questionText]);
        setStartTime(Date.now());
    } catch (error) {
        console.error("Failed to generate question", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Could not generate a new question. Please try again."
        });
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if (subject) {
      startNewQuestion(difficulty, []);
    }
  }, [subject]);

  useEffect(() => {
    if (isSessionOver && subject) {
        addSessionData({
            score: (correctAnswers / TOTAL_QUESTIONS) * 100,
            performanceHistory
        });
    }
  }, [isSessionOver, correctAnswers, performanceHistory, addSessionData, subject]);

  const progressPercentage = useMemo(() => (questionsAnswered / TOTAL_QUESTIONS) * 100, [questionsAnswered]);

  const handleNextQuestion = async () => {
    if (questionsAnswered + 1 >= TOTAL_QUESTIONS) {
      setQuestionsAnswered(prev => prev + 1);
      setIsSessionOver(true);
      return;
    }

    setQuestionsAnswered(prev => prev + 1);

    setIsLoading(true);
    try {
      const response = await adjustDifficulty({
        studentId: 'student-123',
        currentDifficulty: difficulty,
        performanceData: JSON.stringify(performanceHistory.slice(-5)),
      });
      setDifficulty(response.newDifficulty);
      await startNewQuestion(response.newDifficulty, askedQuestions);
      toast({
        title: "Difficulty Adjusted!",
        description: `${response.reasoning}`,
      });
    } catch (error) {
      console.error('Error adjusting difficulty:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not adjust difficulty. Continuing at current level.',
      });
      await startNewQuestion(difficulty, askedQuestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (feedback || !currentQuestion || !subject) return;

    const isCorrect = userAnswer.trim().toLowerCase() === String(currentQuestion.answer).trim().toLowerCase();

    const timeTaken = (Date.now() - startTime) / 1000;
    setPerformanceHistory(prev => [
      ...prev,
      { question: currentQuestion.questionText, correct: isCorrect, timeTaken, subject },
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
            You've completed {TOTAL_QUESTIONS} questions on {subject}. Here's how you did.
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
        <CardTitle className="text-2xl font-bold text-center">{subject} Practice</CardTitle>
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
              <p className="text-2xl font-semibold">{currentQuestion.questionText}</p>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
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
                      <span>Keep trying! Every mistake is a learning opportunity.</span>
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
          {isLoading ? "Generating Question..." : "Next Question"}
        </Button>
      </CardFooter>
    </Card>
  );
}
