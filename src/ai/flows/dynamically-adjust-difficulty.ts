'use server';

/**
 * @fileOverview Dynamically adjusts the difficulty of math questions based on student performance.
 *
 * - adjustDifficulty - A function that adjusts the difficulty of math questions.
 * - AdjustDifficultyInput - The input type for the adjustDifficulty function.
 * - AdjustDifficultyOutput - The return type for the adjustDifficulty function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustDifficultyInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  currentDifficulty: z
    .number()
    .describe('The current difficulty level of the questions (e.g., 1-10).'),
  performanceData: z
    .string()
    .describe(
      'A JSON string containing the student performance data, including the number of correct/incorrect answers, time spent on each question, and topics where the student struggles.'
    ),
});
export type AdjustDifficultyInput = z.infer<typeof AdjustDifficultyInputSchema>;

const AdjustDifficultyOutputSchema = z.object({
  newDifficulty: z
    .number()
    .describe(
      'The adjusted difficulty level for the next set of questions (e.g., 1-10).'
    ),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the difficulty adjustment, based on the student performance data.'
    ),
});
export type AdjustDifficultyOutput = z.infer<typeof AdjustDifficultyOutputSchema>;

export async function adjustDifficulty(input: AdjustDifficultyInput): Promise<AdjustDifficultyOutput> {
  return adjustDifficultyFlow(input);
}

const adjustDifficultyPrompt = ai.definePrompt({
  name: 'adjustDifficultyPrompt',
  input: {schema: AdjustDifficultyInputSchema},
  output: {schema: AdjustDifficultyOutputSchema},
  prompt: `You are an AI tutor specializing in math education. Your task is to dynamically adjust the difficulty of math questions for a student based on their performance data.

  Student ID: {{{studentId}}}
  Current Difficulty Level: {{{currentDifficulty}}}
  Performance Data: {{{performanceData}}}

  Analyze the student's performance data and determine whether to increase, decrease, or maintain the difficulty level. Provide a new difficulty level (1-10) and explain your reasoning. Consider factors such as the number of correct/incorrect answers, time spent on each question, and any specific topics where the student is struggling.
  `,
});

const adjustDifficultyFlow = ai.defineFlow(
  {
    name: 'adjustDifficultyFlow',
    inputSchema: AdjustDifficultyInputSchema,
    outputSchema: AdjustDifficultyOutputSchema,
  },
  async input => {
    try {
      // Parse the performanceData string to ensure it's valid JSON
      JSON.parse(input.performanceData);
    } catch (e) {
      throw new Error(
        'Invalid JSON format for performanceData.  Must be a valid JSON string.'
      );
    }
    const {output} = await adjustDifficultyPrompt(input);
    return output!;
  }
);
