
'use server';
/**
 * @fileOverview Flow for recommending courses based on a topic.
 *
 * - recommendCourses - Function to generate course recommendations.
 * - RecommendCoursesInput - Input type for the function.
 * - RecommendCoursesOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendCoursesInputSchema = z.object({
  topic: z.string().describe('The topic or keyword to search for courses.'),
});
export type RecommendCoursesInput = z.infer<typeof RecommendCoursesInputSchema>;

const CourseRecommendationSchema = z.object({
  title: z.string().describe('The full title of the recommended course.'),
  provider: z.string().describe('The platform or institution offering the course (e.g., Coursera, Udemy, MIT).'),
});

const RecommendCoursesOutputSchema = z.object({
  courses: z.array(CourseRecommendationSchema).describe('A list of 5 to 10 recommended course names.'),
});
export type RecommendCoursesOutput = z.infer<typeof RecommendCoursesOutputSchema>;

export async function recommendCourses(
  input: RecommendCoursesInput
): Promise<RecommendCoursesOutput> {
  return recommendCoursesFlow(input);
}

const recommendCoursesPrompt = ai.definePrompt({
  name: 'recommendCoursesPrompt',
  input: { schema: RecommendCoursesInputSchema },
  output: { schema: RecommendCoursesOutputSchema },
  prompt: `You are an expert academic advisor. Your task is to recommend a list of 5 to 10 real, well-known online courses for a specific topic.

  The user is searching for courses related to: "{{{topic}}}"

  For each course, provide:
  1.  'title': The full, official name of the course.
  2.  'provider': The name of the platform or institution that offers it (e.g., "Coursera", "Udemy", "DeepLearning.AI", "Google").

  Ensure the recommendations are highly relevant to the user's search topic and are from reputable sources. The final output must be a JSON object matching the provided schema.
  `,
});

const recommendCoursesFlow = ai.defineFlow(
  {
    name: 'recommendCoursesFlow',
    inputSchema: RecommendCoursesInputSchema,
    outputSchema: RecommendCoursesOutputSchema,
  },
  async (input) => {
    const { output } = await recommendCoursesPrompt(input);
    return output!;
  }
);
