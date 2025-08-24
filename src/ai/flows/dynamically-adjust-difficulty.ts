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
  prompt: `You are an AI tutor specializing in creating adaptive learning paths. Your task is to dynamically adjust the difficulty of questions for a student based on their recent performance data.

  Student ID: {{{studentId}}}
  Current Difficulty Level: {{{currentDifficulty}}}
  Recent Performance Data: {{{performanceData}}}

  Analyze the student's performance data and determine whether to increase, decrease, or maintain the difficulty level. Provide a new difficulty level (an integer between 1 and 10).
  
  Your reasoning should be concise and encouraging. For example, if the student is doing well, you might say "You're doing great, let's try something a bit more challenging!". If they are struggling, you could say "Let's take a step back and solidify the basics."

  Consider factors such as the number of correct/incorrect answers and the time spent on each question. A higher proportion of correct answers suggests an increase in difficulty, while a high number of incorrect answers suggests a decrease.
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
    // Clamp the difficulty to be between 1 and 10.
    const newDifficulty = Math.max(1, Math.min(10, output!.newDifficulty));
    return { ...output!, newDifficulty };
  }
);
