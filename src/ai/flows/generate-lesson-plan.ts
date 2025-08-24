
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
    .describe('A detailed, user-friendly introduction to the topic.'),
  keyConcepts: z
    .array(
      z.object({
        concept: z.string().describe('The name of the key concept, formula, or rule.'),
        explanation: z.string().describe('A detailed but easy-to-understand explanation of the concept.'),
        example: z.string().describe('A simple example illustrating the concept in action.'),
      })
    )
    .describe(
      'A list of the main concepts related to the topic, each with a clear explanation and an example.'
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
  prompt: `You are an expert tutor. Your task is to create a detailed and easy-to-understand lesson plan for a student who wants to learn about a specific topic.

  The topic is: {{{topic}}}

  Please generate a lesson plan with the following components:
  1.  A clear title for the lesson.
  2.  A detailed, user-friendly introduction to the topic. Explain what it is and why it's important in a simple way.
  3.  A list of key concepts. For each concept, provide the concept name, a detailed but simple explanation, and a clear example of how it's used.
  4.  One clear, step-by-step example problem and its solution that combines the key concepts.
  5.  Two or three practice problems for the student to solve, along with their answers.

  Do NOT find or include any YouTube videos. This is handled by a separate process.

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
