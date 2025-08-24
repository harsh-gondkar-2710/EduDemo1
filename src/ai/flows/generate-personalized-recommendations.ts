'use server';
/**
 * @fileOverview Flow for generating personalized lesson/question recommendations based on student performance.
 *
 * - generatePersonalizedRecommendations - Function to generate personalized recommendations.
 * - PersonalizedRecommendationsInput - Input type for the function.
 * - PersonalizedRecommendationsOutput - Output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  studentId: z.string().describe('Unique identifier for the student.'),
  pastPerformanceData: z.string().describe('Student performance data, including completed lessons/questions, scores, and identified weaknesses.'),
  availableLessons: z.string().describe('List of available lessons/questions that can be recommended.'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.string().describe('Recommended lesson/question with a brief explanation.')
  ).describe('A list of personalized lesson/question recommendations for the student.')
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const recommendLessonPrompt = ai.definePrompt({
  name: 'recommendLessonPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI-powered tutor that provides personalized lesson/question recommendations to students based on their past performance.

  Student ID: {{{studentId}}}
  Past Performance Data: {{{pastPerformanceData}}}
  Available Lessons/Questions: {{{availableLessons}}}

  Based on the student's performance data and the available lessons/questions, provide a list of personalized recommendations. Each recommendation should include the lesson/question and a brief explanation of why it is being recommended.

  Format the output as a JSON object with a "recommendations" field containing an array of strings.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const generatePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await recommendLessonPrompt(input);
    return output!;
  }
);
