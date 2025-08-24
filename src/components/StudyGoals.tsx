
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Goal, Calendar as CalendarIcon, AlertTriangle, Clock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInDays, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';

type Goal = {
  id: number;
  text: string;
  completed: boolean;
  deadline: string | null;
};

export function StudyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState('');
  const [deadline, setDeadline] = useState<Date | undefined>();

  useEffect(() => {
    const storedGoals = localStorage.getItem('studyGoals');
    if (storedGoals) {
      try {
        const parsedGoals: string[] | Goal[] = JSON.parse(storedGoals);
        // Handle both old (string array) and new (Goal object array) formats
        if (Array.isArray(parsedGoals) && typeof parsedGoals[0] === 'string') {
          setGoals((parsedGoals as string[]).map((text, index) => ({ id: Date.now() + index, text, completed: false, deadline: null })));
        } else {
          setGoals(parsedGoals as Goal[]);
        }
      } catch (e) {
        console.error("Failed to parse study goals from localStorage", e);
        // Clear corrupted data
        localStorage.removeItem('studyGoals');
      }
    }
  }, []);
  
  useEffect(() => {
    // Persist goals to localStorage whenever they change
    localStorage.setItem('studyGoals', JSON.stringify(goals));
    // Dispatch a custom event so the dashboard can update in real-time
    window.dispatchEvent(new CustomEvent('studyGoalsUpdated'));
  }, [goals]);


  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      setGoals([...goals, { 
        id: Date.now(), 
        text: newGoal.trim(), 
        completed: false, 
        deadline: deadline ? deadline.toISOString() : null 
    }]);
      setNewGoal('');
      setDeadline(undefined);
    }
  };

  const toggleGoal = (id: number) => {
    setGoals(goals.map(goal => (goal.id === id ? { ...goal, completed: !goal.completed } : goal)));
  };
  
  const deleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id));
  }
  
  const getDeadlineStatus = (deadline: string | null): { text: string; color: string; icon: React.ReactNode } | null => {
    if (!deadline) return null;
    const deadLineDate = new Date(deadline);
    const today = new Date();
    
    if (isPast(deadLineDate) && !isToday(deadLineDate)) {
      return { text: 'Overdue', color: 'text-red-600 dark:text-red-500', icon: <AlertTriangle className="h-3 w-3" /> };
    }
    
    const daysUntil = differenceInDays(deadLineDate, today);
    if (daysUntil >= 0 && daysUntil <= 3) {
      return { text: `Due in ${daysUntil + 1} day(s)`, color: 'text-orange-600 dark:text-orange-500', icon: <Clock className="h-3 w-3" /> };
    }
    
    return null;
  }

  const { activeGoals, completedGoals } = useMemo(() => {
    return {
      activeGoals: goals.filter(g => !g.completed),
      completedGoals: goals.filter(g => g.completed),
    };
  }, [goals]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Goal className="h-10 w-10 text-primary" />
            Study Goals
        </h1>
        <p className="text-muted-foreground mt-2">Keep track of your learning objectives and career skills.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a New Goal</CardTitle>
          <CardDescription>What do you want to achieve next?</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleAddGoal} className="flex flex-wrap items-center gap-2 mb-4">
                <Input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="e.g., 'Master React Hooks' or 'Complete the Python course'"
                className="flex-1 min-w-[200px]"
                />
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "w-[200px] justify-start text-left font-normal",
                        !deadline && "text-muted-foreground"
                    )}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : <span>Set deadline</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    initialFocus
                    />
                </PopoverContent>
                </Popover>
                <Button type="submit">Add Goal</Button>
            </form>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {/* Active Goals Section */}
        <Card>
            <CardHeader>
                <CardTitle>Active Goals ({activeGoals.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                {activeGoals.length > 0 ? (
                    activeGoals.map(goal => {
                        const deadlineStatus = getDeadlineStatus(goal.deadline);
                        return (
                        <div key={goal.id} className="flex items-center justify-between p-3 rounded-md bg-secondary">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`goal-${goal.id}`}
                                    checked={goal.completed}
                                    onCheckedChange={() => toggleGoal(goal.id)}
                                />
                                <div className="flex flex-col">
                                    <label
                                        htmlFor={`goal-${goal.id}`}
                                        className="text-sm font-medium leading-none"
                                    >
                                        {goal.text}
                                    </label>
                                    {goal.deadline && (
                                        <div className="flex items-center gap-4 mt-1">
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                {format(new Date(goal.deadline), "PPP")}
                                            </span>
                                            {deadlineStatus && (
                                                <span className={cn("text-xs font-semibold flex items-center gap-1", deadlineStatus.color)}>
                                                    {deadlineStatus.icon}
                                                    {deadlineStatus.text}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    )})
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        You have no active goals. Add one above to get started!
                    </p>
                )}
                </div>
            </CardContent>
        </Card>

        {/* Completed Goals Section */}
        <Card>
            <CardHeader>
                <CardTitle>Completed Goals ({completedGoals.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                {completedGoals.length > 0 ? (
                    completedGoals.map(goal => (
                        <div key={goal.id} className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id={`goal-${goal.id}`}
                                    checked={goal.completed}
                                    onCheckedChange={() => toggleGoal(goal.id)}
                                />
                                 <label
                                    htmlFor={`goal-${goal.id}`}
                                    className="text-sm font-medium leading-none line-through text-muted-foreground"
                                >
                                    {goal.text}
                                 </label>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No goals completed yet. Keep going!
                    </p>
                )}
                </div>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
