
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateLessonPlan, type LessonPlan } from '@/ai/flows/generate-lesson-plan';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, CheckCircle2, Pencil, Youtube, BrainCircuit, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactPlayer from 'react-player/youtube';

type TutorView = 'lesson' | 'video' | 'practice';

const subjects = ['General', 'Maths', 'Physics', 'Chemistry', 'Biology', 'History', 'Languages'];

export function PersonalisedTutor() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('General');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [tutorView, setTutorView] = useState<TutorView>('lesson');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const { toast } = useToast();
  
  // Add a state to track if the component has mounted on the client
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleGeneratePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setLessonPlan(null);
    setFeedback(null);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setTutorView('lesson');
    setCurrentVideoIndex(0);
    setVideoError(false);

    try {
      // The AI flow can be enhanced to take the subject for more context
      const result = await generateLessonPlan({ topic: `${topic} (in the context of ${subject})` });
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

  const handleCycleVideo = () => {
    if (lessonPlan && lessonPlan.youtubeVideoIds.length > 0) {
        setVideoError(false);
        setCurrentVideoIndex(prevIndex => (prevIndex + 1) % lessonPlan.youtubeVideoIds.length);
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

  const handleVideoError = () => {
    if (lessonPlan && currentVideoIndex < lessonPlan.youtubeVideoIds.length - 1) {
        // Try the next video if the current one fails
        handleCycleVideo();
    } else {
        // If all videos fail, show the error state
        setVideoError(true);
    }
  };

  const currentVideoId = lessonPlan?.youtubeVideoIds[currentVideoIndex];
  const videoWatchUrl = currentVideoId ? `https://www.youtube.com/watch?v=${currentVideoId}` : '';
  const videoEmbedUrl = currentVideoId ? `https://www.youtube.com/embed/${currentVideoId}` : '';


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Personalised Tutor</h1>
        <p className="text-muted-foreground mt-2">Enter any topic you want to learn about, and I'll create a personalized lesson for you.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>What would you like to learn?</CardTitle>
        </CardHeader>
        <form onSubmit={handleGeneratePlan}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={setSubject} defaultValue={subject}>
                    <SelectTrigger className="md:col-span-1">
                        <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                        {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., 'Pythagorean Theorem' or 'The French Revolution'"
                disabled={isLoading}
                className="md:col-span-2"
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !topic}>
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
                <CardContent className="prose dark:prose-invert">
                    <p>{lessonPlan.introduction}</p>
                    <h3 className="text-lg font-semibold mt-4">Key Concepts</h3>
                    <ul className="list-disc pl-5">
                    {lessonPlan.keyConcepts.map((concept, index) => (
                        <li key={index}>{concept}</li>
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
                        {(!currentVideoId) ? (
                            <div className="w-full h-full rounded-lg bg-muted flex items-center justify-center">
                                <p>No videos available for this topic.</p>
                            </div>
                        ) : videoError ? (
                            <div className="w-full h-full rounded-lg bg-muted flex flex-col items-center justify-center text-center p-4">
                                <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                                <p className="font-semibold">Video Unavailable</p>
                                <p className="text-sm text-muted-foreground">
                                  This video can't be embedded.
                                </p>
                            </div>
                        ) : (
                            hasMounted && <ReactPlayer
                                key={currentVideoId}
                                url={videoEmbedUrl}
                                width="100%"
                                height="100%"
                                controls={true}
                                onError={handleVideoError}
                                className="rounded-lg overflow-hidden"
                            />
                        )}
                    </div>
                    {currentVideoId && (
                         <Button asChild variant="link" className="mt-2 -ml-4">
                            <Link href={videoWatchUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Watch on YouTube
                            </Link>
                        </Button>
                    )}
                </CardContent>
                <CardFooter className='gap-4 justify-between'>
                    <div>
                        <Button onClick={() => setTutorView('lesson')} variant="outline">Back to Lesson</Button>
                        <Button onClick={resetPractice} variant="secondary" className="ml-2">
                           <BrainCircuit className="mr-2" />
                            Practice
                        </Button>
                    </div>
                    {lessonPlan.youtubeVideoIds.length > 1 && (
                      <Button onClick={handleCycleVideo} variant="ghost">
                          <RefreshCw className="mr-2" />
                          Next Video
                      </Button>
                    )}
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
