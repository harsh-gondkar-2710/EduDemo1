
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateLessonPlan, type LessonPlan } from '@/ai/flows/generate-lesson-plan';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, CheckCircle2, Pencil, Youtube, BrainCircuit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from './ui/separator';

type TutorView = 'lesson' | 'practice';

type YouTubeVideo = {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
  };
};

const subjects = ['General', 'Maths', 'Physics', 'Chemistry', 'Biology', 'History', 'Languages'];
const languages = ['English', 'Marathi', 'Hindi'];

export function PersonalisedTutor() {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('General');
  const [language, setLanguage] = useState('English');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isFetchingVideos, setIsFetchingVideos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [tutorView, setTutorView] = useState<TutorView>('lesson');
  const { toast } = useToast();

  useEffect(() => {
    if (lessonPlan?.title) {
      const fetchVideos = async () => {
        setIsFetchingVideos(true);
        try {
          const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(`Khan Academy ${lessonPlan.title}`)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch videos');
          }
          const data = await response.json();
          setVideos(data.items || []);
        } catch (error) {
          console.error('Error fetching videos:', error);
          toast({
            variant: 'destructive',
            title: 'Video Search Error',
            description: 'Could not fetch recommended videos from YouTube.',
          });
        } finally {
          setIsFetchingVideos(false);
        }
      };
      fetchVideos();
    }
  }, [lessonPlan, toast]);

  const handleGeneratePlan = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setLessonPlan(null);
    setVideos([]);
    setFeedback(null);
    setCurrentProblemIndex(0);
    setUserAnswer('');
    setTutorView('lesson');

    try {
      const result = await generateLessonPlan({ 
        topic: `${topic} (in the context of ${subject})`,
        language: language,
       });
      setLessonPlan(result);
    } catch (error) {
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
        <h1 className="text-4xl font-bold">Personalised Tutor</h1>
        <p className="text-muted-foreground mt-2">Enter any topic you want to learn about, and I'll create a personalized lesson for you.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>What would you like to learn?</CardTitle>
        </CardHeader>
        <form onSubmit={handleGeneratePlan}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Select onValueChange={setLanguage} defaultValue={language}>
                    <SelectTrigger className="md:col-span-1">
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                </Select>
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
                <CardContent className="prose dark:prose-invert max-w-none">
                    <p>{lessonPlan.introduction}</p>
                    
                    <h3 className="text-lg font-semibold mt-4">Key Concepts</h3>
                    <div className="space-y-4">
                        {lessonPlan.keyConcepts.map((concept, index) => (
                            <div key={index} className="p-4 rounded-md border">
                                <h4 className='font-semibold'>{concept.concept}</h4>
                                <p>{concept.explanation}</p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    <span className="font-semibold">Example:</span> {concept.example}
                                </p>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-semibold mt-4">Example Problem</h3>
                    <p>{lessonPlan.example.problem}</p>
                    <p><strong>Solution:</strong> {lessonPlan.example.solution}</p>

                    {isFetchingVideos ? (
                        <div className='mt-6 space-y-2'>
                           <Skeleton className='h-4 w-1/2' />
                           <Skeleton className='h-4 w-2/3' />
                        </div>
                    ) : videos.length > 0 && (
                        <>
                            <h3 className="text-lg font-semibold mt-6 flex items-center gap-2">
                                <Youtube className="text-red-600" />
                                Recommended Video
                            </h3>
                            <div className="aspect-video mt-2">
                                <iframe
                                    className="w-full h-full rounded-lg"
                                    src={`https://www.youtube.com/embed/${videos[0].id.videoId}`}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                            {videos.length > 1 && (
                                <>
                                    <h4 className="text-md font-semibold mt-4">Additional Videos:</h4>
                                    <ul className="list-disc pl-5">
                                        {videos.slice(1).map((video) => (
                                            <li key={video.id.videoId}>
                                                <a href={`https://www.youtube.com/watch?v=${video.id.videoId}`} target="_blank" rel="noopener noreferrer">
                                                    {video.snippet.title}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    )}
                </CardContent>
                <CardFooter className="gap-4">
                    <Button onClick={resetPractice} variant="secondary">
                       <BrainCircuit className="mr-2" />
                        Practice This Topic
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
