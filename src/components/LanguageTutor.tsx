
'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languageTutor, type LanguageTutorOutput } from '@/ai/flows/language-tutor';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Languages, Volume2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

type LanguageTask = 'translate' | 'correct' | 'explain';

export function LanguageTutor() {
  const [text, setText] = useState('');
  const [task, setTask] = useState<LanguageTask>('translate');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [result, setResult] = useState<LanguageTutorOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleProcessText = async (e: FormEvent) => {
    e.preventDefault();
    if (!text) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await languageTutor({ text, task, targetLanguage });
      setResult(response);
    } catch (error) {
      console.error('Failed to process text:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not process the text as requested.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const playAudio = (audioDataUri: string) => {
    const audio = new Audio(audioDataUri);
    audio.play();
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Language Tutor</h1>
        <p className="text-muted-foreground mt-2">Translate, correct, or explain any text to improve your language skills.</p>
      </div>
      
      <Card>
        <form onSubmit={handleProcessText}>
          <CardHeader>
            <CardTitle>Enter your text</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., 'Hello, how are you?' or 'I goed to the store yesterday.'"
              className="min-h-[150px]"
              disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <Select onValueChange={(value) => setTask(value as LanguageTask)} defaultValue={task}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="translate">Translate</SelectItem>
                    <SelectItem value="correct">Correct Grammar</SelectItem>
                    <SelectItem value="explain">Explain Grammar</SelectItem>
                </SelectContent>
               </Select>
               {task === 'translate' && (
                <Select onValueChange={setTargetLanguage} defaultValue={targetLanguage}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                    </SelectContent>
                </Select>
               )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Process Text'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {isLoading && (
         <Card>
            <CardHeader>
                <Skeleton className="h-8 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
            </CardContent>
         </Card>
      )}

      {result && (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Languages className="text-primary"/>
                    Result
                </CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert">
                <p className="text-lg">{result.processedText}</p>
                {result.explanation && (
                    <Alert className="mt-4">
                        <AlertTitle>Explanation</AlertTitle>
                        <AlertDescription>{result.explanation}</AlertDescription>
                    </Alert>
                )}
                {result.audioOutputDataUri && (
                    <div className="mt-4">
                        <Button onClick={() => playAudio(result.audioOutputDataUri!)} variant="outline">
                            <Volume2 className="mr-2"/>
                            Listen
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}
