
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star } from 'lucide-react';
import Image from 'next/image';

type Course = {
  id: number;
  title: string;
  provider: string;
  description: string;
  imageUrl: string;
  tags: string[];
  rating: number;
  isPopular?: boolean;
};

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Google AI Essentials',
    provider: 'Google',
    description: 'Learn the basics of AI and machine learning from Google experts.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Machine Learning', 'Google'],
    rating: 4.8,
    isPopular: true,
  },
  {
    id: 2,
    title: 'Microsoft Azure Fundamentals',
    provider: 'Microsoft',
    description: 'A comprehensive introduction to cloud computing on Azure.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Cloud', 'Azure', 'Microsoft'],
    rating: 4.7,
    isPopular: true,
  },
  {
    id: 3,
    title: 'React - The Complete Guide',
    provider: 'Udemy',
    description: 'Dive deep into React.js and build powerful web applications.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Web Development', 'React', 'JavaScript'],
    rating: 4.6,
  },
  {
    id: 4,
    title: 'Python for Everybody',
    provider: 'Coursera',
    description: 'Master the fundamentals of programming with Python.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Python', 'Programming', 'Data Science'],
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 5,
    title: 'Data Science Professional Certificate',
    provider: 'IBM',
    description: 'Launch your career in data science with this professional certificate from IBM.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Data Science', 'Python', 'IBM'],
    rating: 4.7,
  },
  {
    id: 6,
    title: 'AWS Certified Cloud Practitioner',
    provider: 'Amazon Web Services',
    description: 'Validate your cloud fluency with this foundational AWS certification.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Cloud', 'AWS', 'Amazon'],
    rating: 4.8,
    isPopular: true,
  },
];


export function Certifications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const popularCourses = mockCourses.filter(c => c.isPopular);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchTerm.trim()) {
      setFilteredCourses([]);
      return;
    }
    const lowercasedTerm = searchTerm.toLowerCase();
    const results = mockCourses.filter(course => 
      course.title.toLowerCase().includes(lowercasedTerm) ||
      course.provider.toLowerCase().includes(lowercasedTerm) ||
      course.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
    );
    setFilteredCourses(results);
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-t-lg">
            <Image
                src={course.imageUrl}
                alt={course.title}
                layout="fill"
                objectFit="cover"
                data-ai-hint={`${course.tags[0]} ${course.tags[1]}`}
            />
        </div>
        <CardTitle className="mt-4">{course.title}</CardTitle>
        <CardDescription>{course.provider}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{course.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {course.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="font-bold">{course.rating}</span>
        </div>
        <Button>View Course</Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Certifications & Courses</h1>
        <p className="text-muted-foreground mt-2">Find courses to expand your skills and get certified.</p>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-2xl mx-auto items-center space-x-2">
        <Input
          type="text"
          placeholder="Search for courses, providers, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </form>
      
      {hasSearched ? (
        <section>
            <h2 className="text-2xl font-bold mb-4">Search Results</h2>
            {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => <CourseCard key={course.id} course={course} />)}
                </div>
            ) : (
                <p>No courses found for your search term. Try searching for popular topics like "AI", "React", or "Cloud".</p>
            )}
        </section>
      ) : (
        <section>
            <h2 className="text-2xl font-bold mb-4">Popular Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popularCourses.map(course => <CourseCard key={course.id} course={course} />)}
            </div>
        </section>
      )}

    </div>
  );
}
