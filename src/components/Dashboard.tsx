
'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from 'recharts';
import { TrendingUp, Award, Bot, ScanSearch, PencilRuler, Map, Goal, Lock, Star } from 'lucide-react';
import { usePerformance } from '@/hooks/use-performance';
import { AgeGate } from './AgeGate';
import { Badge } from './ui/badge';

const chartConfig: ChartConfig = {
  score: { label: 'Score', color: 'hsl(var(--primary))' },
  completed: { label: 'Completed', color: 'hsl(var(--primary))' },
  remaining: { label: 'Remaining', color: 'hsl(var(--muted))' },
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

  const overallProgressData = useMemo(() => {
    const roundedProgress = Math.round(overallProgress);
    return [
      { name: 'completed', value: roundedProgress, fill: 'hsl(var(--primary))' },
      { name: 'remaining', value: 100 - roundedProgress, fill: 'hsl(var(--muted))' }
    ]
  }, [overallProgress]);
  
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
            <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your average score across all sessions.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square h-[250px]"
                >
                    <PieChart>
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={overallProgressData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                             <Cell
                                key="completed"
                                fill="var(--color-completed)"
                                radius={[4, 4, 0, 0]}
                              />
                              <Cell
                                key="remaining"
                                fill="var(--color-remaining)"
                                radius={[0, 0, 4, 4]}
                              />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
             <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    You're at {Math.round(overallProgress)}% overall. Keep it up!
                    <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Over Time</CardTitle>
            <CardDescription>Your scores over your last sessions.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={progressData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="score" fill="var(--color-score)" radius={4} />
              </BarChart>
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
