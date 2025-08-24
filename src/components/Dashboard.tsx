
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { TrendingUp, Award, Bot, ScanSearch, PencilRuler, Map, Goal, Lock, Star } from 'lucide-react';
import { usePerformance } from '@/hooks/use-performance';
import { AgeGate } from './AgeGate';
import { Badge } from './ui/badge';

const chartConfig: ChartConfig = {
  score: { label: 'Score', color: 'hsl(var(--primary))' },
};

const appFeatures = [
    { href: '/tutor', label: 'Personalised Tutor', icon: Bot, description: 'Get custom lessons on any topic.' },
    { href: '/solver', label: 'Solver', icon: ScanSearch, description: 'Solve problems from text or images.' },
    { href: '/practice', label: 'Practice', icon: PencilRuler, description: 'Test your knowledge with adaptive quizzes.' },
    { href: '/career', label: 'Career Mapper', icon: Map, description: 'Generate a learning roadmap for your career.' },
    { href: '/goals', label: 'Study Goals', icon: Goal, description: 'Track your learning objectives and deadlines.' },
]

const motivationalQuotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "The expert in anything was once a beginner.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Strive for progress, not perfection."
];

export function Dashboard() {
  const { progressData, overallProgress, completedGoalsCount, sessionCount } = usePerformance();
  const [quote, setQuote] = useState('');

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  }, []);

  const lastSessionProgress = useMemo(() => {
    if (progressData.length < 2) return 0;
    const lastScore = progressData[progressData.length - 1].score;
    const secondLastScore = progressData[progressData.length - 2].score;
    if (secondLastScore === 0 && lastScore > 0) return 100;
    if (secondLastScore === 0) return 0;
    return Math.round(((lastScore - secondLastScore) / secondLastScore) * 100);
  }, [progressData]);
  
  const allBadges = useMemo(() => [
    { name: 'High Achiever I', description: 'Overall score > 80%', earned: overallProgress > 80, icon: Star },
    { name: 'High Achiever II', description: 'Overall score > 90%', earned: overallProgress > 90, icon: Star },
    { name: 'Consistent Learner I', description: 'Complete 5 sessions', earned: sessionCount >= 5, icon: TrendingUp },
    { name: 'Consistent Learner II', description: 'Complete 10 sessions', earned: sessionCount >= 10, icon: TrendingUp },
    { name: 'Consistent Learner III', description: 'Complete 20 sessions', earned: sessionCount >= 20, icon: TrendingUp },
    { name: 'Goal Setter I', description: 'Complete 5 goals', earned: completedGoalsCount >= 5, icon: Goal },
    { name: 'Goal Setter II', description: 'Complete 10 goals', earned: completedGoalsCount >= 10, icon: Goal },
    { name: 'Goal Setter III', description: 'Complete 20 goals', earned: completedGoalsCount >= 20, icon: Goal },
  ], [overallProgress, sessionCount, completedGoalsCount]);

  const earnedBadges = allBadges.filter(b => b.earned);
  const unearnedBadges = allBadges.filter(b => !b.earned);

  return (
    <div className="space-y-8">
      <AgeGate />
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome, Learner!</h1>
        <p className="text-muted-foreground mt-2 italic">"{quote}"</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
            <p className="text-xs text-muted-foreground">
                {lastSessionProgress >= 0 ? `+${lastSessionProgress}` : lastSessionProgress}% from last session
            </p>
          </CardContent>
        </Card>

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
      </div>
      
       <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary" />
                    Achievements
                </CardTitle>
                <CardDescription>
                    Unlock new badges by completing goals and practice sessions.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Unlocked ({earnedBadges.length})</h3>
                     <div className="flex flex-wrap gap-4">
                        {earnedBadges.length > 0 ? (
                            earnedBadges.map(badge => (
                                <Badge key={badge.name} variant="default" className="text-base py-2 px-4 flex items-center gap-2">
                                   <badge.icon className="h-4 w-4" />
                                   {badge.name}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">Keep learning to earn new badges!</p>
                        )}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold mb-2">Locked ({unearnedBadges.length})</h3>
                     <div className="flex flex-wrap gap-4">
                        {unearnedBadges.map(badge => (
                            <div key={badge.name} className="flex flex-col items-center gap-2 text-center p-4 border rounded-lg bg-muted/50 w-40">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                                <span className="font-semibold text-sm">{badge.name}</span>
                                <span className="text-xs text-muted-foreground">{badge.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>

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
