
'use client';

import { useState, type FormEvent, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { solveProblem, type SolveProblemOutput } from '@/ai/flows/solve-problem';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, CheckCircle, Upload, X } from 'lucide-react';
import Image from 'next/image';

export function Solver() {
  const [problemText, setProblemText] = useState('');
  const [problemImage, setProblemImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<SolveProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProblemImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setProblemImage(null);
    setImagePreview(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleSolveProblem = async (e: FormEvent) => {
    e.preventDefault();
    if (!problemText && !problemImage) {
        toast({
            variant: 'destructive',
            title: 'Input Required',
            description: 'Please provide a problem in text or image format.',
        });
        return;
    };

    setIsLoading(true);
    setResult(null);

    try {
      let imageDataUri: string | undefined = undefined;
      if (problemImage) {
        imageDataUri = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(problemImage);
        });
      }

      const response = await solveProblem({ problemText, imageDataUri });
      setResult(response);
    } catch (error) {
      console.error('Failed to solve problem:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not solve the problem at this time.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Problem Solver</h1>
        <p className="text-muted-foreground mt-2">Stuck on a problem? Enter it below or upload an image, and I'll solve it for you.</p>
      </div>
      
      <Card>
        <form onSubmit={handleSolveProblem}>
          <CardHeader>
            <CardTitle>Enter Your Problem</CardTitle>
            <CardDescription>You can type the problem, upload an image, or both.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g., 'What is the integral of 2x dx?' or 'If a train travels at 60 km/h...'"
              className="min-h-[150px]"
              disabled={isLoading}
            />
            <div className="space-y-2">
                <Label htmlFor="image-upload">Upload an Image (Optional)</Label>
                <div className="flex items-center gap-4">
                    <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isLoading}
                        ref={fileInputRef}
                        className="flex-1"
                    />
                </div>
            </div>
            {imagePreview && (
                <div className="relative w-48 h-48 border rounded-md overflow-hidden">
                    <Image src={imagePreview} alt="Problem preview" layout="fill" objectFit="contain" />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={removeImage}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || (!problemText && !problemImage)}>
              {isLoading ? 'Solving...' : 'Solve Problem'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-6 w-full" />
            </CardContent>
         </Card>
      )}

      {result && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary"/>
                    Solution
                </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-semibold">Step-by-step Solution:</h3>
                <p className="whitespace-pre-wrap">{result.solution}</p>
                
                <div className="mt-6 p-4 bg-secondary/50 rounded-md">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                        <CheckCircle className="text-green-600" />
                        Final Answer
                    </h4>
                    <p className="text-lg font-bold mt-2">{result.answer}</p>
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
