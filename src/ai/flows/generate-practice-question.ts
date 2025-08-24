
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
  subject: z.string().describe('The subject for the practice question (e.g., "Calculus", "Physics", "General"). If "General", pick a topic from any subject.'),
  difficulty: z
    .number()
    .min(1)
    .max(10)
    .describe('The difficulty level of the question (1-10).'),
  age: z.number().nullable().optional().describe("The student's age, to tailor the question appropriately."),
  previousQuestions: z
    .array(z.string())
    .optional()
    .describe('A list of questions that have already been asked in this session.'),
});
export type GeneratePracticeQuestionInput = z.infer<
  typeof GeneratePracticeQuestionInputSchema
>;

const PracticeQuestionSchema = z.object({
  questionText: z.string().describe('The text of the practice question.'),
  options: z.array(z.string()).length(4).describe('A list of 4 possible answers for the question.'),
  correctAnswerIndices: z.array(z.number()).describe('A list containing the 0-based index/indices of the correct answer(s) from the options array.'),
  explanation: z.string().describe('A brief explanation of why the answer is correct.'),
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
  prompt: `You are an expert tutor. Your task is to generate a single multiple-choice practice question for a student.

  The subject is: {{{subject}}}. If the subject is 'General', you can choose a topic from any field like Math, Science, History, or General Knowledge.
  The difficulty level (1-10) is: {{{difficulty}}}
  {{#if age}}The student's age is: {{{age}}}{{/if}}

  {{#if previousQuestions}}
  The user has already answered the following questions in this session. Do not generate a question that is substantially similar to any of these:
  {{#each previousQuestions}}
  - "{{this}}"
  {{/each}}
  {{/if}}

  Please generate one multiple-choice question with exactly 4 options in the 'options' array.
  The question should be clear and concise.
  Indicate the 0-based index (0, 1, 2, or 3) of the correct answer(s) in the 'correctAnswerIndices' array. There can be one or more correct answers.
  Provide a brief and clear explanation for the correct answer.
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
