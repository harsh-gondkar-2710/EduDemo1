
'use server';
/**
 * @fileOverview A flow for language learning tasks like translation, grammar correction, and explanation.
 *
 * - languageTutor - Function to perform a language task.
 * - LanguageTutorInput - Input type for the function.
 * - LanguageTutorOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LanguageTutorInputSchema = z.object({
  text: z.string().describe('The input text from the user.'),
  task: z
    .enum(['translate', 'correct_and_explain'])
    .describe(
      'The language task to perform: translate the text, or correct it and explain the grammatical changes.'
    ),
  sourceLanguage: z
    .string()
    .describe('The source language for the task (e.g., "English").'),
  targetLanguage: z
    .string()
    .optional()
    .describe('The target language for translation (e.g., "Spanish").'),
});
export type LanguageTutorInput = z.infer<typeof LanguageTutorInputSchema>;

const LanguageTutorOutputSchema = z.object({
  processedText: z.string().describe('The resulting text after the task is performed (e.g., the translation or the corrected text).'),
  explanation: z.string().optional().describe('An explanation of the grammar correction or the concept.'),
  audioOutputDataUri: z.string().optional().describe('A data URI for the audio output of the processed text.'),
});
export type LanguageTutorOutput = z.infer<typeof LanguageTutorOutputSchema>;

export async function languageTutor(
  input: LanguageTutorInput
): Promise<LanguageTutorOutput> {
  return languageTutorFlow(input);
}

const languageTutorPrompt = ai.definePrompt({
  name: 'languageTutorPrompt',
  input: { schema: LanguageTutorInputSchema },
  output: { schema: z.object({
    processedText: z.string(),
    explanation: z.string().optional(),
  }) },
  prompt: `You are an expert language tutor. Perform the requested task on the user's text.

  Task: {{{task}}}
  Source Language: {{{sourceLanguage}}}
  {{#if targetLanguage}}Target Language: {{{targetLanguage}}}{{/if}}
  User's Text: "{{{text}}}"

  - If the task is 'translate', translate the text from the source language to the target language.
  - If the task is 'correct_and_explain', correct any grammatical errors in the text from the source language. Provide the corrected version in the 'processedText' field. Then, provide a clear and detailed explanation of all the corrections you made in the 'explanation' field.

  Keep your responses concise and clear.
  `,
});

const languageTutorFlow = ai.defineFlow(
  {
    name: 'languageTutorFlow',
    inputSchema: LanguageTutorInputSchema,
    outputSchema: LanguageTutorOutputSchema,
  },
  async (input) => {
    const { output } = await languageTutorPrompt(input);

    if(!output) {
      throw new Error('Could not generate a response.');
    }

    // This part can be improved to handle audio generation
    // For now, we will return an empty audio data URI
    return {
      ...output,
      audioOutputDataUri: '',
    };
  }
);
