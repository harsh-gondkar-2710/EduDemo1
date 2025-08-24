
'use server';
/**
 * @fileOverview Flow for generating a personalized lesson plan for a given topic.
 *
 * - generateLessonPlan - Function to generate the lesson plan.
 * - GenerateLessonPlanInput - Input type for the function.
 * - LessonPlan - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLessonPlanInputSchema = z.object({
  topic: z.string().describe('The topic the user wants to learn about.'),
});
export type GenerateLessonPlanInput = z.infer<typeof GenerateLessonPlanInputSchema>;

const LessonPlanSchema = z.object({
  title: z.string().describe('A clear and concise title for the lesson plan.'),
  introduction: z
    .string()
    .describe('A brief, engaging introduction to the topic.'),
  keyConcepts: z
    .array(z.string())
    .describe(
      'A list of the main concepts, formulas, or rules related to the topic.'
    ),
  example: z.object({
    problem: z
      .string()
      .describe('A step-by-step example problem that illustrates the topic.'),
    solution: z.string().describe('The detailed solution to the example problem.'),
  }),
  practiceProblems: z.array(
    z.object({
      question: z.string().describe('A practice question for the user to solve.'),
      answer: z.string().describe('The correct answer to the practice question.'),
    })
  ).describe('A list of 2-3 practice problems for the user.'),
  youtubeVideoIds: z.array(z.string()).describe('A list of relevant YouTube video IDs for the topic. Just the IDs, not the full URLs. The ID is the string of characters that comes after "v=" in a YouTube URL. It should be an 11-character alphanumeric string. Order them by relevance.'),
});
export type LessonPlan = z.infer<typeof LessonPlanSchema>;

export async function generateLessonPlan(
  input: GenerateLessonPlanInput
): Promise<LessonPlan> {
  return generateLessonPlanFlow(input);
}

const lessonPlanPrompt = ai.definePrompt({
  name: 'lessonPlanPrompt',
  input: { schema: GenerateLessonPlanInputSchema },
  output: { schema: LessonPlanSchema },
  prompt: `You are an expert tutor. Your task is to create a simple and clear lesson plan for a student who wants to learn about a specific topic.

  The topic is: {{{topic}}}

  Please generate a lesson plan with the following components:
  1.  A clear title for the lesson.
  2.  A brief introduction to the topic.
  3.  A list of key concepts, formulas, or rules.
  4.  One clear, step-by-step example problem and its solution.
  5.  Two or three practice problems for the student to solve, along with their answers.
  6.  Search YouTube using the topic as keywords. Find up to four of the most relevant, high-quality, and concise educational videos exclusively from the "Khan Academy" channel where the keywords are present in the video title. Provide only the video IDs (the string of characters after "v=" in the URL). The ID must be an 11-character alphanumeric string. Order them by relevance.

  Keep the language simple and encouraging. The goal is to make the topic understandable for a beginner.
  `,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: GenerateLessonPlanInputSchema,
    outputSchema: LessonPlanSchema,
  },
  async (input) => {
    const { output } = await lessonPlanPrompt(input);
    return output!;
  }
);
