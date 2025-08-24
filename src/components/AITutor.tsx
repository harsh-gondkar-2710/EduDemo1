
'use client';

import { useState, type FormEvent, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateLessonPlan, type LessonPlan } from '@/ai/flows/generate-lesson-plan';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Book, CheckCircle2, Pencil, Youtube, BrainCircuit } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from './ui/separator';

type TutorView = 'lesson' | 'practice';
const subjects = ['General', 'Maths', 'Physics', 'Chemistry', 'Biology', 'History', 'Social Studies', 'GK'];
const languages = ['English', 'Marathi', 'Hindi'];

interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

export function AITutor() {
  const [topic, setTopic] = useState('');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);
  const [tutorView, setTutorView] = useState<TutorView>('lesson');
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const { toast } = useToast();

  const fetchVideos = async (searchTopic: string) => {
    setIsLoadingVideos(true);
    setVideos([]);
    try {
        const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchTopic)}`);
        if (!response.ok) {
            throw new Error('Failed to fetch videos');
        }
        const data = await response.json();
        setVideos(data.items || []);
    } catch (error) {
        console.error('Failed to fetch YouTube videos:', error);
        toast({
            variant: 'destructive',
            title: 'Video Error',
            description: 'Could not load recommended videos.',
        });
    } finally {
        setIsLoadingVideos(false);
    }
  };

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
      const fullTopic = selectedSubject === 'General' ? topic : `${topic} (in the context of ${selectedSubject})`;
      const result = await generateLessonPlan({ topic: fullTopic, language: selectedLanguage });
      setLessonPlan(result);
      // Always search for videos in English using the base topic
      fetchVideos(`${topic} tutorial`);
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
        <form onSubmit={handleGeneratePlan}>
            <CardHeader>
                <CardTitle>What would you like to learn?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject-select">Subject</Label>
                        <Select onValueChange={setSelectedSubject} defaultValue={selectedSubject} disabled={isLoading}>
                            <SelectTrigger id="subject-select">
                                <SelectValue placeholder="Select a subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(subject => <SelectItem key={subject} value={subject}>{subject}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="language-select">Language</Label>
                        <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage} disabled={isLoading}>
                            <SelectTrigger id="language-select">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                {languages.map(lang => <SelectItem key={lang} value={lang}>{lang}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="topic-input">Topic</Label>
                    <Input
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 'Pythagorean Theorem', 'The French Revolution'"
                    disabled={isLoading}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
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
                      <ul className="list-disc pl-5 space-y-2">
                        {lessonPlan.keyConcepts.map((item, index) => (
                          <li key={index}>
                              <strong>{item.concept}:</strong> {item.explanation}
                              <br />
                              <em className="text-sm">Example: {item.example}</em>
                          </li>
                        ))}
                      </ul>
                      <h3 className="text-lg font-semibold mt-4">Example</h3>
                      <p>{lessonPlan.example.problem}</p>
                      <p><strong>Solution:</strong> {lessonPlan.example.solution}</p>
                  </CardContent>
                  <CardFooter className="gap-4">
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
          </div>
          
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="text-red-600" />
                  Recommended Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingVideos && (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                )}
                {!isLoadingVideos && videos.length === 0 && (
                  <p className="text-sm text-muted-foreground">No videos found for this topic.</p>
                )}
                {videos.map((video) => (
                  <Link
                    key={video.id.videoId}
                    href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center gap-4 p-2 rounded-md hover:bg-secondary">
                      <Image
                        src={video.snippet.thumbnails.default.url}
                        alt={video.snippet.title}
                        width={120}
                        height={90}
                        className="rounded-md"
                      />
                      <p className="text-sm font-medium group-hover:text-primary leading-tight">
                        {video.snippet.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>

        </div>
      )}
    </div>
  );
}
