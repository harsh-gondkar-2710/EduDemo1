'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateCareerRoadmap, type CareerRoadmap } from '@/ai/flows/generate-career-roadmap';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Briefcase, Map, Search, Sparkles } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function CareerMapper() {
  const [jobRole, setJobRole] = useState('');
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleGenerateRoadmap = async (role: string) => {
    if (!role) return;

    setIsLoading(true);
    setRoadmap(null);
    setJobRole(role);

    try {
      const result = await generateCareerRoadmap({ jobRole: role });
      setRoadmap(result);
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not generate a roadmap for this role.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleGenerateRoadmap(jobRole);
  };
  
  const handleFindCourse = (skill: string) => {
    router.push(`/certifications?q=${encodeURIComponent(skill)}`);
  };
  
  const handleAddToGoals = () => {
    if (roadmap) {
        const goals = roadmap.roadmap.map(step => step.skill);
        localStorage.setItem('studyGoals', JSON.stringify(goals));
        toast({
            title: 'Study Goals Updated',
            description: 'Your career roadmap has been added to your study goals.',
        });
        router.push('/goals');
    }
  };

  const popularRoles = ['Full-Stack Developer', 'Data Scientist', 'AI/ML Engineer', 'DevOps Engineer'];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
          <Map className="h-10 w-10 text-primary" />
          Career Mapper
        </h1>
        <p className="text-muted-foreground mt-2">Enter your desired job role, and our AI will generate a personalized learning roadmap for you.</p>
      </div>

      <Card>
        <form onSubmit={handleFormSubmit}>
          <CardHeader>
            <CardTitle>What is your career goal?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., 'Cybersecurity Analyst', 'Product Manager', 'UI/UX Designer'"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !jobRole}>
                <Search className='mr-2' />
                {isLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium mr-2">Popular roles:</span>
              {popularRoles.map(role => (
                <Button key={role} variant="outline" size="sm" onClick={() => handleGenerateRoadmap(role)} disabled={isLoading}>
                  {role}
                </Button>
              ))}
            </div>
          </CardContent>
        </form>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </CardContent>
        </Card>
      )}

      {roadmap && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="text-primary" />
              Your Roadmap to Becoming a {roadmap.jobRole}
            </CardTitle>
            <CardDescription>Follow these steps to build the skills you need for your target role.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {roadmap.roadmap.map((step, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className='flex items-center gap-4'>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">{index + 1}</span>
                        {step.skill}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none pl-12">
                    <p>{step.description}</p>
                    <Button variant="secondary" size="sm" className="mt-2" onClick={() => handleFindCourse(step.skill)}>
                        <Award className='mr-2' />
                        Find a course for this skill
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddToGoals}>
                <Sparkles className="mr-2" />
                Add All Skills to My Study Goals
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
