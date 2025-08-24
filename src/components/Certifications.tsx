
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
  // AI Courses
  {
    id: 1,
    title: 'AI for Everyone',
    provider: 'Coursera',
    description: 'A non-technical introduction to AI, its terminology, and what it can realistically do.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Beginner', 'Business'],
    rating: 4.8,
    isPopular: true,
  },
  {
    id: 2,
    title: 'Google AI Essentials',
    provider: 'Google',
    description: 'Learn the basics of AI and machine learning from Google experts.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Machine Learning', 'Google'],
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 3,
    title: 'Generative AI Fundamentals',
    provider: 'IBM',
    description: 'Explore the fundamentals of generative AI, including models like GPT and DALL-E.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Generative AI', 'LLM'],
    rating: 4.7,
  },
  {
    id: 4,
    title: 'Introduction to TensorFlow for AI',
    provider: 'DeepLearning.AI',
    description: 'Get hands-on experience with TensorFlow to build and train neural networks.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'TensorFlow', 'Deep Learning'],
    rating: 4.6,
  },
  {
    id: 5,
    title: 'AI Product Management',
    provider: 'Duke University',
    description: 'Learn how to manage AI projects and build a successful AI strategy.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Product Management', 'Strategy'],
    rating: 4.7,
  },
  {
    id: 6,
    title: 'Natural Language Processing Specialization',
    provider: 'Coursera',
    description: 'Master NLP with techniques like sentiment analysis, text generation, and chatbots.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'NLP', 'Python'],
    rating: 4.8,
  },
  {
    id: 7,
    title: 'Ethical AI and Governance',
    provider: 'Udacity',
    description: 'Understand the ethical implications and governance frameworks for AI systems.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Ethics', 'Governance'],
    rating: 4.6,
  },
  {
    id: 8,
    title: 'Computer Vision Basics',
    provider: 'University of Buffalo',
    description: 'Learn the fundamentals of computer vision, including image processing and object detection.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Computer Vision', 'OpenCV'],
    rating: 4.5,
  },
  {
    id: 9,
    title: 'AI in Healthcare Specialization',
    provider: 'Stanford University',
    description: 'Discover the applications of AI in medicine, from diagnostics to drug discovery.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'Healthcare', 'Medicine'],
    rating: 4.9,
  },
  {
    id: 10,
    title: 'Building AI-Powered Apps with LangChain',
    provider: 'Codecademy',
    description: 'Learn to build applications on top of large language models using LangChain.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['AI', 'LangChain', 'LLM'],
    rating: 4.7,
  },

  // Full Stack Courses
  {
    id: 11,
    title: 'Full-Stack Web Development with React',
    provider: 'The Hong Kong University of Science and Technology',
    description: 'Master front-end and back-end development with React, Node.js, and MongoDB.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'React', 'Node.js'],
    rating: 4.8,
    isPopular: true,
  },
  {
    id: 12,
    title: 'The Odin Project',
    provider: 'The Odin Project',
    description: 'A free, open-source curriculum for learning full stack development with JavaScript.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'JavaScript', 'Open Source'],
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 13,
    title: 'Meta Back-End Developer Professional Certificate',
    provider: 'Meta',
    description: 'Learn to build robust back-end systems with Python and the Django framework.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'Python', 'Django'],
    rating: 4.7,
  },
  {
    id: 14,
    title: 'Next.js 14 & React - The Complete Guide',
    provider: 'Udemy',
    description: 'Build modern, server-rendered React applications with the latest Next.js features.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'Next.js', 'React'],
    rating: 4.8,
  },
  {
    id: 15,
    title: 'DevOps on AWS Specialization',
    provider: 'Amazon Web Services',
    description: 'Learn to implement CI/CD pipelines and deploy applications on AWS.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'DevOps', 'AWS'],
    rating: 4.7,
  },
  {
    id: 16,
    title: 'Go: The Complete Developer\'s Guide',
    provider: 'Udemy',
    description: 'Master the Go programming language for high-performance back-end services.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'Go', 'Backend'],
    rating: 4.6,
  },
  {
    id: 17,
    title: 'GraphQL: The Big Picture',
    provider: 'Pluralsight',
    description: 'Understand how to build and consume modern APIs with GraphQL.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'GraphQL', 'API'],
    rating: 4.5,
  },
  {
    id: 18,
    title: 'Docker for the Absolute Beginner',
    provider: 'KodeKloud',
    description: 'Learn containerization from scratch with Docker to streamline your development workflow.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'Docker', 'DevOps'],
    rating: 4.7,
  },
  {
    id: 19,
    title: 'TypeScript: The Complete Developer\'s Guide',
    provider: 'Udemy',
    description: 'Add static typing to your JavaScript projects to build more robust applications.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'TypeScript', 'JavaScript'],
    rating: 4.8,
  },
  {
    id: 20,
    title: 'Microservices with Node JS and React',
    provider: 'Udemy',
    description: 'Design and build a scalable microservices architecture for your full stack applications.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Full Stack', 'Microservices', 'Architecture'],
    rating: 4.6,
  },

  // Machine Learning Courses
  {
    id: 21,
    title: 'Machine Learning Specialization',
    provider: 'Stanford University',
    description: 'A foundational course by Andrew Ng covering the core concepts of machine learning.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'AI', 'Algorithms'],
    rating: 5.0,
    isPopular: true,
  },
  {
    id: 22,
    title: 'Python for Data Science and Machine Learning Bootcamp',
    provider: 'Udemy',
    description: 'Learn Python and use it for data analysis and machine learning with libraries like NumPy, Pandas, and Scikit-learn.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Python', 'Data Science'],
    rating: 4.7,
    isPopular: true,
  },
  {
    id: 23,
    title: 'Deep Learning Specialization',
    provider: 'DeepLearning.AI',
    description: 'Build and train deep neural networks, and learn about CNNs, RNNs, and LSTMs.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Deep Learning', 'Neural Networks'],
    rating: 4.9,
    isPopular: true,
  },
  {
    id: 24,
    title: 'TensorFlow Developer Professional Certificate',
    provider: 'Google',
    description: 'Prepare for the Google TensorFlow Developer Certification exam.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'TensorFlow', 'Certification'],
    rating: 4.7,
  },
  {
    id: 25,
    title: 'Reinforcement Learning Specialization',
    provider: 'University of Alberta',
    description: 'Master reinforcement learning, from the basics to advanced deep reinforcement learning.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Reinforcement Learning', 'AI'],
    rating: 4.6,
  },
  {
    id: 26,
    title: 'Scikit-Learn in 3 Hours',
    provider: 'freeCodeCamp',
    description: 'A concise, hands-on tutorial for getting started with Scikit-learn for ML tasks.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Scikit-learn', 'Python'],
    rating: 4.5,
  },
  {
    id: 27,
    title: 'MLOps (Machine Learning Operations) Fundamentals',
    provider: 'Google Cloud',
    description: 'Learn the principles and practices of MLOps for deploying and managing ML models.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'MLOps', 'DevOps'],
    rating: 4.6,
  },
  {
    id: 28,
    title: 'Advanced Learning Algorithms',
    provider: 'Stanford University',
    description: 'A follow-up to the famous ML course, covering more advanced topics and best practices.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Algorithms', 'AI'],
    rating: 4.9,
  },
  {
    id: 29,
    title: 'PyTorch for Deep Learning with Python',
    provider: 'Udemy',
    description: 'Learn to build deep learning models with PyTorch, a popular alternative to TensorFlow.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'PyTorch', 'Deep Learning'],
    rating: 4.7,
  },
  {
    id: 30,
    title: 'Kaggle Competitions and ML Projects',
    provider: 'Kaggle',
    description: 'Learn by doing with practical ML projects and competitions on the Kaggle platform.',
    imageUrl: 'https://placehold.co/600x400.png',
    tags: ['Machine Learning', 'Kaggle', 'Projects'],
    rating: 4.8,
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
