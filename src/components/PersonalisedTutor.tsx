
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateLessonPlan, type LessonPlan } from '@/ai/flows/generate-lesson-plan';
import { generateVideo } from '@/ai/flows/generate-video';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, CheckCircle2, Pencil, Youtube, BrainCircuit, RefreshCw, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [videoIds, setVideoIds] = useState<string[]>([]);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);
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
    setVideoIds([]);
    setAiVideoUrl(null);

    try {
      const result = await generateLessonPlan({ topic: `${topic} (in the context of ${subject})` });
      setLessonPlan(result);
      if (result.youtubeVideoIds && result.youtubeVideoIds.length > 0) {
        setVideoIds(result.youtubeVideoIds);
      }
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
  
  const handleGenerateAiVideo = async () => {
    if (!lessonPlan) return;
    setIsGeneratingVideo(true);
    setAiVideoUrl(null);
    try {
      const result = await generateVideo({ topic: lessonPlan.title });
      setAiVideoUrl(result.videoDataUri);
    } catch (error) {
      console.error('Failed to generate AI video:', error);
      toast({
        variant: 'destructive',
        title: 'AI Video Error',
        description: 'Could not generate a video at this time. Please try again later.',
      });
    } finally {
        setIsGeneratingVideo(false);
    }
  }

  const handleNextVideo = () => {
    if (videoIds.length > 1) {
        const remainingVideos = videoIds.slice(1);
        setVideoIds(remainingVideos);
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

  const currentVideoId = videoIds.length > 0 ? videoIds[0] : null;
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
                    {aiVideoUrl ? (
                         <div className="aspect-video">
                            <video src={aiVideoUrl} controls className="w-full h-full rounded-lg bg-black" />
                         </div>
                    ) : (
                        <div className="aspect-video">
                            {!currentVideoId ? (
                                <div className="w-full h-full rounded-lg bg-muted flex flex-col items-center justify-center text-center p-4">
                                    <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                                    <p className="font-semibold">No YouTube Videos Available</p>
                                    <p className="text-sm text-muted-foreground">
                                      Try generating an AI video instead.
                                    </p>
                                </div>
                            ) : (
                                <iframe
                                    key={currentVideoId}
                                    className="w-full h-full rounded-lg"
                                    src={videoEmbedUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>
                    )}
                    {currentVideoId && !aiVideoUrl && (
                         <div className='flex items-center gap-2 mt-2'>
                            <AlertCircle className='h-4 w-4 text-muted-foreground' />
                            <p className='text-sm text-muted-foreground'>
                                If the video is unavailable,
                                <Button asChild variant="link" className="p-1">
                                    <Link href={videoWatchUrl} target="_blank" rel="noopener noreferrer">
                                        watch it on YouTube
                                    </Link>
                                </Button>
                                .
                            </p>
                         </div>
                    )}
                </CardContent>
                <CardFooter className='gap-4 justify-between flex-wrap'>
                    <div className="flex gap-2">
                        <Button onClick={() => setTutorView('lesson')} variant="outline">Back to Lesson</Button>
                        <Button onClick={resetPractice} variant="secondary">
                           <BrainCircuit className="mr-2" />
                            Practice
                        </Button>
                    </div>
                    <div className="flex gap-2">
                        {currentVideoId && !aiVideoUrl && (
                            <Button onClick={handleNextVideo} variant="ghost" disabled={videoIds.length <= 1}>
                                <RefreshCw className="mr-2" />
                                Next Video
                            </Button>
                        )}
                        <Button onClick={handleGenerateAiVideo} disabled={isGeneratingVideo}>
                            {isGeneratingVideo ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2" />
                                    Watch AI-generated video
                                </>
                            )}
                        </Button>
                    </div>
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
