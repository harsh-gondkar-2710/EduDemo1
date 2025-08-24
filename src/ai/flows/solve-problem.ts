
'use server';
/**
 * @fileOverview A flow for solving problems from text or an image.
 *
 * - solveProblem - A function that handles the problem-solving process.
 * - SolveProblemInput - The input type for the solveProblem function.
 * - SolveProblemOutput - The return type for the solveProblem function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SolveProblemInputSchema = z.object({
  problemText: z.string().optional().describe('The text of the problem to solve.'),
  imageDataUri: z
    .string()
    .optional()
    .describe(
      "An image of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SolveProblemInput = z.infer<typeof SolveProblemInputSchema>;

const SolveProblemOutputSchema = z.object({
  solution: z.string().describe('A detailed, step-by-step solution to the problem.'),
  answer: z.string().describe('The final answer to the problem.'),
});
export type SolveProblemOutput = z.infer<typeof SolveProblemOutputSchema>;

export async function solveProblem(input: SolveProblemInput): Promise<SolveProblemOutput> {
  return solveProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveProblemPrompt',
  input: { schema: SolveProblemInputSchema },
  output: { schema: SolveProblemOutputSchema },
  prompt: `You are an expert problem solver. Your task is to analyze the given problem, either from text or an image, and provide a detailed step-by-step solution and the final answer.

  The problem is provided below. It might be in text format, image format, or both.
  {{#if problemText}}
  Problem Text:
  {{{problemText}}}
  {{/if}}

  {{#if imageDataUri}}
  Problem Image:
  {{media url=imageDataUri}}
  {{/if}}

  Please provide a clear, easy-to-follow, step-by-step explanation of how to arrive at the solution. Then, state the final answer clearly.
  `,
});

const solveProblemFlow = ai.defineFlow(
  {
    name: 'solveProblemFlow',
    inputSchema: SolveProblemInputSchema,
    outputSchema: SolveProblemOutputSchema,
  },
  async (input) => {
    if (!input.problemText && !input.imageDataUri) {
        throw new Error('You must provide either problem text or an image.');
    }
    const { output } = await prompt(input);
    return output!;
  }
);
