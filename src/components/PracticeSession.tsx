
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Lightbulb, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adjustDifficulty } from '@/ai/flows/dynamically-adjust-difficulty';
import { generatePracticeQuestion, type PracticeQuestion } from '@/ai/flows/generate-practice-question';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformance } from '@/hooks/use-performance';
import { cn } from '@/lib/utils';

const TOTAL_QUESTIONS = 10;

type PerformanceRecord = {
  question: string;
  correct: boolean;
  timeTaken: number;
  subject: string;
};

interface PracticeSessionProps {
    subject: string;
    onBack: () => void;
}

export function PracticeSession({ subject, onBack }: PracticeSessionProps) {
  const [difficulty, setDifficulty] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect'; message: string } | null>(null);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isSessionOver, setIsSessionOver] = useState(false);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceRecord[]>([]);
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const { addSessionData, age } = usePerformance();
  
  const startNewQuestion = async (newDifficulty: number, prevQuestions: string[]) => {
    if (!subject) return;
    setIsLoading(true);
    setFeedback(null);
    setSelectedAnswers([]);
    try {
        const question = await generatePracticeQuestion({ 
            subject, 
            difficulty: newDifficulty,
            previousQuestions: prevQuestions,
            ...(age && { age }),
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
  
  const handleAnswerSelect = (option: string) => {
    if (feedback) return;

    setSelectedAnswers(prev => {
        if (!currentQuestion) return [];
        const isMultiSelect = currentQuestion.correctAnswers.length > 1;
        if(isMultiSelect) {
            if(prev.includes(option)) {
                return prev.filter(ans => ans !== option);
            } else {
                return [...prev, option];
            }
        } else {
            return [option];
        }
    });
  }

  const handleSubmit = () => {
    if (feedback || !currentQuestion || !subject || selectedAnswers.length === 0) return;

    const sortedSelected = [...selectedAnswers].sort();
    const sortedCorrect = [...currentQuestion.correctAnswers].sort();
    const isCorrect = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);

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
        message: `Not quite. The correct answer is: ${currentQuestion.correctAnswers.join(', ')}.`,
      });
    }
  };
  
  const getButtonVariant = (option: string) => {
    if (!feedback) return selectedAnswers.includes(option) ? 'default' : 'outline';
    
    const isCorrect = currentQuestion?.correctAnswers.includes(option);
    const isSelected = selectedAnswers.includes(option);

    if (isCorrect) return 'default';
    if (isSelected && !isCorrect) return 'destructive';
    return 'outline';
  }


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
          <Button onClick={onBack}>Back to Subjects</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className='relative'>
            <Button variant="ghost" size="icon" className="absolute -left-12 top-1/2 -translate-y-1/2" onClick={onBack}>
                <ArrowLeft />
            </Button>
            <CardTitle className="text-2xl font-bold text-center">{subject} Practice</CardTitle>
            <CardDescription className="text-center">
            Question {questionsAnswered + 1} of {TOTAL_QUESTIONS}
            </CardDescription>
        </div>
        <Progress value={progressPercentage} className="w-full mt-2" />
      </CardHeader>
      <CardContent className="space-y-6 min-h-[350px]">
        {isLoading || !currentQuestion ? (
          <div className="space-y-4 text-center pt-8">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="text-center pt-4">
              <p className="text-xl font-semibold">{currentQuestion.questionText}</p>
              {currentQuestion.correctAnswers.length > 1 && <p className="text-sm text-muted-foreground">(Select all that apply)</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                    <Button
                        key={index}
                        variant={getButtonVariant(option)}
                        className="h-auto py-3 justify-start text-left whitespace-normal"
                        onClick={() => handleAnswerSelect(option)}
                        disabled={!!feedback}
                    >
                       <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
                       <span>{option}</span>
                    </Button>
                ))}
            </div>
            {feedback && (
              <Alert variant={feedback.type === 'correct' ? 'default' : 'destructive'}>
                {feedback.type === 'correct' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>
                  {feedback.type === 'correct' ? 'Correct!' : 'Incorrect'}
                </AlertTitle>
                <AlertDescription>
                  {feedback.message}
                  <div className="mt-2 flex items-start gap-2 text-sm">
                      <Lightbulb className="h-4 w-4 text-accent shrink-0 mt-1" />
                      <span><strong>Explanation:</strong> {currentQuestion.explanation}</span>
                    </div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {!feedback ? (
            <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={selectedAnswers.length === 0 || isLoading}
            >
                Submit
            </Button>
        ) : (
            <Button
                onClick={handleNextQuestion}
                className="w-full"
                disabled={isLoading}
                variant="secondary"
            >
                {isLoading ? "Generating Question..." : "Next Question"}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
