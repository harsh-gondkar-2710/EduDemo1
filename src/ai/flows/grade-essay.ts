
'use server';
/**
 * @fileOverview Flow for grading an essay and providing feedback.
 *
 * - gradeEssay - Function to grade the essay.
 * - GradeEssayInput - Input type for the function.
 * - EssayFeedback - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GradeEssayInputSchema = z.object({
  essayText: z.string().describe('The full text of the essay to be graded.'),
});
export type GradeEssayInput = z.infer<typeof GradeEssayInputSchema>;

const EssayFeedbackSchema = z.object({
  overallScore: z.number().min(0).max(100).describe('A numerical score for the essay out of 100.'),
  overallFeedback: z.string().describe('A paragraph summarizing the overall quality of the essay.'),
  strengths: z.array(z.string()).describe('A list of specific strengths of the essay.'),
  areasForImprovement: z.array(z.string()).describe('A list of specific areas where the essay could be improved.'),
  enhancedEssay: z.string().describe('An enhanced version of the original essay, rewritten to incorporate the suggested improvements.'),
});
export type EssayFeedback = z.infer<typeof EssayFeedbackSchema>;

export async function gradeEssay(
  input: GradeEssayInput
): Promise<EssayFeedback> {
  return gradeEssayFlow(input);
}

const gradeEssayPrompt = ai.definePrompt({
  name: 'gradeEssayPrompt',
  input: { schema: GradeEssayInputSchema },
  output: { schema: EssayFeedbackSchema },
  prompt: `You are an expert writing instructor. Your task is to grade the following essay and provide constructive feedback.

  Essay Text:
  {{{essayText}}}

  Please evaluate the essay based on clarity, argumentation, structure, and grammar. Provide a numerical score out of 100.
  
  Your feedback should include:
  1. An overall summary of the essay's quality.
  2. A list of 2-3 specific strengths.
  3. A list of 2-3 specific areas for improvement with actionable advice.
  4. A rewritten, enhanced version of the essay that incorporates your suggested improvements. The tone and core message should remain the same as the original.
  
  Be encouraging and focus on helping the writer improve.
  `,
});

const gradeEssayFlow = ai.defineFlow(
  {
    name: 'gradeEssayFlow',
    inputSchema: GradeEssayInputSchema,
    outputSchema: EssayFeedbackSchema,
  },
  async (input) => {
    const { output } = await gradeEssayPrompt(input);
    return output!;
  }
);
