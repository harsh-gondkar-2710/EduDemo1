'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Award } from 'lucide-react';

type Course = {
  title: string;
  provider: string;
  category: 'AI' | 'Full Stack' | 'Machine Learning';
  thumbnail: string;
  dataAiHint: string;
};

const mockCourses: Course[] = [
    // AI Courses
    { title: 'AI for Everyone', provider: 'DeepLearning.AI', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'artificial intelligence' },
    { title: 'Introduction to TensorFlow for AI', provider: 'DeepLearning.AI', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'neural network' },
    { title: 'IBM AI Engineering Professional Certificate', provider: 'IBM', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'machine learning code' },
    { title: 'Google AI for Anyone', provider: 'Google', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'google ai' },
    { title: 'Natural Language Processing Specialization', provider: 'DeepLearning.AI', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'natural language processing' },
    { title: 'Advanced AI: Deep Reinforcement Learning', provider: 'Udacity', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'reinforcement learning' },
    { title: 'Computer Vision Basics', provider: 'Coursera', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'computer vision' },
    { title: 'Applied AI with DeepLearning', provider: 'IBM', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'applied ai' },
    { title: 'AI in Practice: Executive Briefing', provider: 'edX', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'ai business' },
    { title: 'Generative AI Fundamentals', provider: 'Google Cloud', category: 'AI', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'generative ai' },
  
    // Full Stack Courses
    { title: 'Meta Front-End Developer Professional Certificate', provider: 'Meta', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'front end code' },
    { title: 'Meta Back-End Developer Professional Certificate', provider: 'Meta', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'back end code' },
    { title: 'Full-Stack Web Development with React', provider: 'Coursera', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'react code' },
    { title: 'The Complete 2024 Web Development Bootcamp', provider: 'Udemy', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'web development' },
    { title: 'IBM Full Stack Software Developer', provider: 'IBM', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'software development' },
    { title: 'Node.js, Express, MongoDB & More', provider: 'Udemy', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'database code' },
    { title: 'Python and Django Full Stack Web Developer', provider: 'Udemy', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'python django' },
    { title: 'Spring Boot & Angular', provider: 'Coursera', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'angular code' },
    { title: 'Full Stack Open', provider: 'University of Helsinki', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'open source' },
    { title: 'The Odin Project', provider: 'The Odin Project', category: 'Full Stack', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'viking ship' },
  
    // Machine Learning Courses
    { title: 'Machine Learning Specialization', provider: 'DeepLearning.AI', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'machine learning' },
    { title: 'Google Machine Learning Education', provider: 'Google', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'google brain' },
    { title: 'IBM Machine Learning Professional Certificate', provider: 'IBM', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'ibm computer' },
    { title: 'Machine Learning with Python', provider: 'Coursera', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'python code' },
    { title: 'Advanced Machine Learning Specialization', provider: 'Coursera', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'advanced algorithm' },
    { title: 'Deep Learning Specialization', provider: 'DeepLearning.AI', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'deep learning' },
    { title: 'TensorFlow Developer Certificate', provider: 'DeepLearning.AI', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'tensorflow logo' },
    { title: 'Machine Learning Engineering for Production', provider: 'DeepLearning.AI', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'mlops production' },
    { title: 'Probabilistic Machine Learning', provider: 'Coursera', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'probability chart' },
    { title: 'Unsupervised Learning, Recommenders, Reinforcement Learning', provider: 'DeepLearning.AI', category: 'Machine Learning', thumbnail: 'https://placehold.co/600x400.png', dataAiHint: 'recommendation engine' },
  ];
  

export function Certifications() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    if (query) {
      const results = mockCourses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.category.toLowerCase().includes(query) ||
        course.provider.toLowerCase().includes(query)
      );
      setFilteredCourses(results);
    } else {
      // Show popular/trending courses if no search query
      setFilteredCourses(mockCourses.filter(c => ['AI', 'Full Stack'].includes(c.category)).slice(0, 6));
    }
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold flex items-center justify-center gap-2">
            <Award className="h-10 w-10 text-primary" />
            Certifications & Courses
        </h1>
        <p className="text-muted-foreground mt-2">Find courses to level up your skills and advance your career.</p>
      </div>

      <div className="flex w-full max-w-lg mx-auto items-center space-x-2">
        <Input
          type="search"
          placeholder="Search for courses..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
            <Search className="mr-2" />
            Search
        </Button>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">{searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Courses'}</h2>
        {filteredCourses.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course, index) => (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <div className="aspect-[3/2] relative w-full">
                    <Image src={course.thumbnail} alt={course.title} layout="fill" objectFit="cover" className="rounded-t-lg" data-ai-hint={course.dataAiHint}/>
                  </div>
                  <CardTitle className="mt-4">{course.title}</CardTitle>
                  <CardDescription>{course.provider}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                   <Badge variant="secondary">{course.category}</Badge>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">View Course</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <p>No courses found for your search criteria.</p>
        )}
      </div>
    </div>
  );
}
