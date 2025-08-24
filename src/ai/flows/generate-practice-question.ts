'use server';
/**
 * @fileOverview Flow for generating a practice question for a given subject and difficulty.
 *
 * - generatePracticeQuestion - Function to generate a practice question.
 * - GeneratePracticeQuestionInput - Input type for the function.
 * - PracticeQuestion - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePracticeQuestionInputSchema = z.object({
  subject: z.string().describe('The subject for the practice question.'),
  difficulty: z.number().min(1).max(10).describe('The difficulty level of the question (1-10).'),
});
export type GeneratePracticeQuestionInput = z.infer<typeof GeneratePracticeQuestionInputSchema>;

const PracticeQuestionSchema = z.object({
  questionText: z.string().describe('The text of the practice question.'),
  answer: z.string().describe('The correct answer to the question.'),
});
export type PracticeQuestion = z.infer<typeof PracticeQuestionSchema>;

export async function generatePracticeQuestion(
  input: GeneratePracticeQuestionInput
): Promise<PracticeQuestion> {
  return generatePracticeQuestionFlow(input);
}

const practiceQuestionPrompt = ai.definePrompt({
  name: 'practiceQuestionPrompt',
  input: { schema: GeneratePracticeQuestionInputSchema },
  output: { schema: PracticeQuestionSchema },
  prompt: `You are an expert tutor. Your task is to generate a single practice question for a student.

  The subject is: {{{subject}}}
  The difficulty level (1-10) is: {{{difficulty}}}

  Please generate one question that is appropriate for the given subject and difficulty level.
  The question should be clear and concise.
  The answer should be a simple string or number. Avoid complex answers.
  `,
});

const generatePracticeQuestionFlow = ai.defineFlow(
  {
    name: 'generatePracticeQuestionFlow',
    inputSchema: GeneratePracticeQuestionInputSchema,
    outputSchema: PracticeQuestionSchema,
  },
  async (input) => {
    const { output } = await practiceQuestionPrompt(input);
    return output!;
  }
);
