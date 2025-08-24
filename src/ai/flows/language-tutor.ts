
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
    .enum(['translate', 'correct', 'explain'])
    .describe(
      'The language task to perform: translate, correct grammar, or explain grammar.'
    ),
  sourceLanguage: z
    .string()
    .optional()
    .describe('The source language for translation (e.g., "English").'),
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
  {{#if sourceLanguage}}Source Language: {{{sourceLanguage}}}{{/if}}
  {{#if targetLanguage}}Target Language: {{{targetLanguage}}}{{/if}}
  User's Text: "{{{text}}}"

  - If the task is 'translate', translate the text from the source language to the target language.
  - If the task is 'correct', correct any grammatical errors in the text and provide the corrected version in the 'processedText' field. Also, provide a brief explanation of the correction in the 'explanation' field. The source text is in {{{sourceLanguage}}}.
  - If the task is 'explain', explain the grammatical concept demonstrated in the text. Put the explanation in the 'explanation' field and return the original text in the 'processedText' field. The source text is in {{{sourceLanguage}}}.

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
