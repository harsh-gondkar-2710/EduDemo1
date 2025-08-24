
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart } from 'recharts';
import { Lightbulb, BookOpen, Brain, TrendingUp, Award, Bot, ScanSearch, PencilRuler, Map, Goal } from 'lucide-react';
import { generatePersonalizedRecommendations } from '@/ai/flows/generate-personalized-recommendations';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { usePerformance } from '@/hooks/use-performance';
import { AgeGate } from './AgeGate';
import { Badge } from './ui/badge';

const chartConfig: ChartConfig = {
  score: { label: 'Score', color: 'hsl(var(--primary))' },
  strength: { label: 'Strength', color: 'hsl(var(--accent))' },
};

const mockStudentData = {
  studentId: 'student-123',
  pastPerformanceData: JSON.stringify([
    { topic: 'Addition', correct: 19, total: 20 },
    { topic: 'Subtraction', correct: 16, total: 20 },
    { topic: 'Multiplication', correct: 14, total: 20, struggledWith: 'double digits' },
    { topic: 'Division', correct: 12, total: 20, struggledWith: 'remainders' },
  ]),
  availableLessons: JSON.stringify([
    'Two-Digit Multiplication Practice',
    'Understanding Remainders in Division',
    'Advanced Addition',
    'Complex Subtraction with Borrowing',
  ]),
};

const appFeatures = [
    { href: '/tutor', label: 'Personalised Tutor', icon: Bot, description: 'Get custom lessons on any topic.' },
    { href: '/solver', label: 'Solver', icon: ScanSearch, description: 'Solve problems from text or images.' },
    { href: '/practice', label: 'Practice', icon: PencilRuler, description: 'Test your knowledge with adaptive quizzes.' },
    { href: '/career', label: 'Career Mapper', icon: Map, description: 'Generate a learning roadmap for your career.' },
    { href: '/goals', label: 'Study Goals', icon: Goal, description: 'Track your learning objectives and deadlines.' },
]

export function Dashboard() {
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { progressData, topicPerformanceData, overallProgress, strengths, weaknesses, completedGoalsCount } = usePerformance();
  
  const lastWeekProgress = useMemo(() => {
    if (progressData.length < 2) return 0;
    const lastScore = progressData[progressData.length - 1].score;
    const secondLastScore = progressData[progressData.length - 2].score;
    if (secondLastScore === 0) return lastScore > 0 ? 100 : 0;
    return Math.round(((lastScore - secondLastScore) / secondLastScore) * 100);
  }, [progressData]);

  const badges = useMemo(() => {
    const earnedBadges = [];
    if (overallProgress > 80) {
        earnedBadges.push({ name: 'High Achiever', description: 'Maintain an overall score above 80%.' });
    }
    if (progressData.length >= 5) {
        earnedBadges.push({ name: 'Consistent Learner', description: 'Complete 5 practice sessions.' });
    }
    if (completedGoalsCount >= 5) {
        earnedBadges.push({ name: 'Goal Setter', description: 'Complete 5 study goals.' });
    }
    return earnedBadges;
  }, [overallProgress, progressData.length, completedGoalsCount]);


  const handleGetRecommendations = async () => {
    setIsLoading(true);
    try {
      const result = await generatePersonalizedRecommendations(mockStudentData);
      setRecommendations(result.recommendations);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not fetch recommendations.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <AgeGate />
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground mt-2">Here's a summary of your progress. Keep up the great work!</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <p className="text-xs text-muted-foreground">
                {lastWeekProgress >= 0 ? `+${lastWeekProgress}` : lastWeekProgress}% from last session
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strengths</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strengths[0] || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Your strongest area</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Areas for Improvement</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weaknesses[0] || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">Let's focus here!</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Your scores over your last sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <LineChart data={progressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Topic Performance</CardTitle>
            <CardDescription>Your current strength in each topic.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={topicPerformanceData} layout="vertical" margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="topic" type="category" tickLine={false} axisLine={false} tickMargin={5} width={80}/>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="strength" layout="vertical" fill="var(--color-strength)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
       <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary" />
                    Achievements
                </CardTitle>
                <CardDescription>
                    You've earned {badges.length} badge(s) for your hard work.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
                {badges.length > 0 ? (
                    badges.map(badge => (
                        <Badge key={badge.name} variant="secondary" className="text-base py-1 px-3">
                           {badge.name}
                        </Badge>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">Keep learning to earn new badges!</p>
                )}
            </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Lightbulb className="text-primary" />
                Personalized Recommendations
            </CardTitle>
            <CardDescription>
                Based on your recent performance, here are some areas to focus on next.
            </CardDescription>
            </CardHeader>
            <CardContent>
            {isLoading ? (
                <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                </div>
            ) : recommendations.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5">
                {recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">Click the button to generate your recommendations.</p>
            )}
            </CardContent>
            <CardFooter>
            <Button onClick={handleGetRecommendations} disabled={isLoading}>
                {isLoading ? 'Generating...' : 'Get My Recommendations'}
            </Button>
            </CardFooter>
        </Card>
      </div>

       <div>
        <h2 className="text-2xl font-bold mb-4 text-center">Explore Your Tools</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appFeatures.map((feature) => (
                <Link href={feature.href} key={feature.href} className="block">
                    <Card className="h-full hover:border-primary transition-colors">
                        <CardHeader className="flex-row items-center gap-4">
                             <feature.icon className="h-8 w-8 text-primary" />
                             <div>
                                <CardTitle>{feature.label}</CardTitle>
                                <CardDescription>{feature.description}</CardDescription>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
