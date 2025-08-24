'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Award, BookOpen } from 'lucide-react';
import { recommendCourses } from '@/ai/flows/recommend-courses';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

type Course = {
  title: string;
  provider: string;
  description: string;
};

export function Certifications() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async (query: string) => {
    if (!query) return;
    setIsLoading(true);
    setRecommendedCourses([]);
    try {
      const result = await recommendCourses({ topic: query });
      setRecommendedCourses(result.courses);
    } catch (error) {
      console.error('Failed to get course recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not fetch course recommendations at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (initialQuery) {
      handleGetRecommendations(initialQuery);
    }
  }, [initialQuery]);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleGetRecommendations(searchQuery);
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Award className="h-10 w-10 text-primary" />
            Certifications & Courses
        </h1>
        <p className="text-muted-foreground mt-2">Find courses to level up your skills and advance your career.</p>
      </div>

      <Card>
        <form onSubmit={handleFormSubmit}>
            <CardHeader>
                <CardTitle>Search for Courses</CardTitle>
                <CardDescription>Enter a topic, skill, or technology to get AI-powered course recommendations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex w-full items-center space-x-2">
                    <Input
                        type="search"
                        placeholder="e.g., 'React', 'Data Science', 'Machine Learning'"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !searchQuery}>
                        <Search className="mr-2" />
                        {isLoading ? 'Searching...' : 'Get Recommendations'}
                    </Button>
                </div>
            </CardContent>
        </form>
      </Card>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">
            {searchQuery ? `Recommendations for "${searchQuery}"` : 'Enter a topic to see recommendations'}
        </h2>
        
        {isLoading && (
            <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                    <Card key={index} className="p-4">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-4 w-full" />
                    </Card>
                ))}
            </div>
        )}
        
        {recommendedCourses.length > 0 ? (
          <div className="space-y-4">
            {recommendedCourses.map((course, index) => (
              <Card key={index} className="p-4">
                  <CardTitle className="text-lg font-semibold flex items-start gap-3">
                    <BookOpen className="h-5 w-5 mt-1 text-primary shrink-0" />
                    <span>{course.title}</span>
                  </CardTitle>
                  <CardDescription className="ml-8">by {course.provider}</CardDescription>
                  <CardContent className="p-0 ml-8 mt-2">
                      <p className="text-sm">{course.description}</p>
                      <Button asChild variant="link" className="px-0 h-auto py-0 mt-2">
                        <a href={`https://www.google.com/search?q=${encodeURIComponent(course.title + " " + course.provider)}`} target="_blank" rel="noopener noreferrer">
                            Find on Google
                        </a>
                      </Button>
                  </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          !isLoading && searchQuery && <p>No courses found for your search criteria.</p>
        )}
      </div>
    </div>
  );
}
