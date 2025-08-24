
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Goal, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
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
      const parsedGoals: string[] = JSON.parse(storedGoals);
      setGoals(parsedGoals.map((text, index) => ({ id: Date.now() + index, text, completed: false, deadline: null })));
      // Clear after importing
      localStorage.removeItem('studyGoals');
    }
  }, []);

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

  const completedCount = goals.filter(g => g.completed).length;
  const totalCount = goals.length;

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
          <CardTitle>Your Goals</CardTitle>
          <CardDescription>
            {totalCount > 0 ? `You've completed ${completedCount} of ${totalCount} goals.` : 'Add a goal to get started!'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddGoal} className="flex flex-wrap gap-2 mb-4">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a new study goal..."
              className="flex-1"
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
          <div className="space-y-2">
            {goals.length > 0 ? (
                goals.map(goal => (
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
                                    className={`text-sm font-medium leading-none ${goal.completed ? 'line-through text-muted-foreground' : ''}`}
                                >
                                    {goal.text}
                                </label>
                                {goal.deadline && (
                                    <span className={cn(
                                        "text-xs text-muted-foreground mt-1 flex items-center gap-1",
                                        goal.completed && 'line-through'
                                    )}>
                                       <CalendarIcon className="h-3 w-3" />
                                       {format(new Date(goal.deadline), "PPP")}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => deleteGoal(goal.id)}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                    Your study goals will appear here.
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
