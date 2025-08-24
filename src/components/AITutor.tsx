
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateLessonPlan, type LessonPlan } from '@/ai/flows/generate-lesson-plan';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, CheckCircle2, Pencil, Youtube, BrainCircuit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type TutorView = 'lesson' | 'video' | 'practice';

export function AITutor() {
  const [topic, setTopic] = useState('');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [tutorView, setTutorView] = useState<TutorView>('lesson');
  const { toast } = useToast();

  const handleGeneratePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setLessonPlan(null);
    setFeedback(null);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setTutorView('lesson');

    try {
      const result = await generateLessonPlan({ topic });
      setLessonPlan(result);
    } catch (error) {
      console.error('Failed to generate lesson plan:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate a lesson plan for this topic.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAnswer = (e: FormEvent) => {
    e.preventDefault();
    if (!lessonPlan) return;
    const problem = lessonPlan.practiceProblems[currentProblemIndex];
    // A simple check - can be improved with a more robust AI-based check
    const isCorrect = userAnswer.trim().toLowerCase() === String(problem.answer).trim().toLowerCase();
    setFeedback({
      isCorrect,
      explanation: isCorrect ? 'Correct! Great job.' : `Not quite. The correct answer is ${problem.answer}.`,
    });
  };
  
  const handleNextProblem = () => {
    if(!lessonPlan) return;
    if(currentProblemIndex < lessonPlan.practiceProblems.length - 1) {
        setCurrentProblemIndex(prev => prev + 1);
        setUserAnswer('');
        setFeedback(null);
    } else {
        toast({ title: "Practice Complete!", description: "You've finished all the practice problems." });
        setTutorView('lesson');
    }
  }

  const resetPractice = () => {
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setFeedback(null);
    setTutorView('practice');
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">AI Tutor</h1>
        <p className="text-muted-foreground mt-2">Enter any topic you want to learn about, and I'll create a personalized lesson for you.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>What would you like to learn?</CardTitle>
        </CardHeader>
        <form onSubmit={handleGeneratePlan}>
          <CardContent>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., 'Pythagorean Theorem', 'The French Revolution', 'How Photosynthesis Works'"
              disabled={isLoading}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Generating Lesson...' : 'Generate Lesson'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
         </Card>
      )}

      {lessonPlan && (
        <>
          {tutorView === 'lesson' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Book className="text-primary"/>
                        {lessonPlan.title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p>{lessonPlan.introduction}</p>
                    <h3 className="text-lg font-semibold mt-4">Key Concepts</h3>
                    <ul className="list-disc pl-5 space-y-4">
                      {lessonPlan.keyConcepts.map((item, index) => (
                        <li key={index}>
                          <strong>{item.concept}:</strong> {item.explanation}
                          <br />
                          <em>Example: {item.example}</em>
                        </li>
                      ))}
                    </ul>
                    <h3 className="text-lg font-semibold mt-4">Example</h3>
                    <p>{lessonPlan.example.problem}</p>
                    <p><strong>Solution:</strong> {lessonPlan.example.solution}</p>
                </CardContent>
                <CardFooter className="gap-4">
                    <Button onClick={() => setTutorView('video')}>
                        <Youtube className="mr-2" />
                        Watch an Explanation Video
                    </Button>
                    <Button onClick={resetPractice} variant="secondary">
                       <BrainCircuit className="mr-2" />
                        Practice
                    </Button>
                </CardFooter>
            </Card>
          )}

          {tutorView === 'video' && (
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Youtube className="text-red-600" />
                        Explanation Video
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video">
                        <iframe
                            className="w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${lessonPlan.youtubeVideoId}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </CardContent>
                <CardFooter className='gap-4'>
                    <Button onClick={() => setTutorView('lesson')} variant="outline">Back to Lesson</Button>
                    <Button onClick={resetPractice} variant="secondary">
                       <BrainCircuit className="mr-2" />
                        Practice
                    </Button>
                </CardFooter>
            </Card>
          )}

          {tutorView === 'practice' && lessonPlan.practiceProblems.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Pencil className="text-primary" />
                            Practice Problem
                        </CardTitle>
                        <CardDescription>
                            {lessonPlan.practiceProblems[currentProblemIndex].question}
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={handleCheckAnswer}>
                        <CardContent>
                            <Input
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                placeholder="Your answer"
                                disabled={!!feedback}
                            />
                            {feedback && (
                                <Alert className="mt-4" variant={feedback.isCorrect ? 'default' : 'destructive'}>
                                    <CheckCircle2 className="h-4 w-4" />
                                    <AlertTitle>{feedback.isCorrect ? 'Correct!' : 'Incorrect'}</AlertTitle>
                                    <AlertDescription>{feedback.explanation}</AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                        <CardFooter className="justify-between">
                            <Button type="button" onClick={() => setTutorView('lesson')} variant="outline">Back to Lesson</Button>
                            {!feedback ? (
                                <Button type="submit">Check Answer</Button>
                            ) : (
                                <Button type="button" onClick={handleNextProblem}>
                                    {currentProblemIndex === lessonPlan.practiceProblems.length - 1 ? 'Finish' : 'Next Problem'}
                                </Button>
                            )}
                        </CardFooter>
                    </form>
                </Card>
            )}
        </>
      )}
    </div>
  );
}
