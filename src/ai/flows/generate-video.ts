
'use server';
/**
 * @fileOverview Flow for generating a short video based on a topic.
 *
 * - generateVideo - Function to generate the video.
 * - GenerateVideoInput - Input type for the function.
 * - GenerateVideoOutput - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { MediaPart } from 'genkit';

const GenerateVideoInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a video.'),
});
export type GenerateVideoInput = z.infer<typeof GenerateVideoInputSchema>;

const GenerateVideoOutputSchema = z.object({
  videoDataUri: z.string().describe('The generated video as a data URI.'),
});
export type GenerateVideoOutput = z.infer<typeof GenerateVideoOutputSchema>;

export async function generateVideo(
  input: GenerateVideoInput
): Promise<GenerateVideoOutput> {
  // Since video generation can be slow, we'll increase the timeout for this server action.
  // This is a Next.js-specific feature.
  const { unstable_setRequestStore } = await import('next/dist/server/web/spec-extension/request');
  unstable_setRequestStore(new Request(new URL('http://localhost')), {
    ...new Response(),
    signal: AbortSignal.timeout(120000) // 2 minutes
  });
  return generateVideoFlow(input);
}

const generateVideoFlow = ai.defineFlow(
  {
    name: 'generateVideoFlow',
    inputSchema: GenerateVideoInputSchema,
    outputSchema: GenerateVideoOutputSchema,
  },
  async (input) => {
    let { operation } = await ai.generate({
      model: googleAI.model('veo-3.0-generate-preview'),
      prompt: `Generate a short, educational video explaining the concept of "${input.topic}". The video should be visually engaging and suitable for a learning context.`,
    });

    if (!operation) {
      throw new Error('Expected the model to return an operation');
    }

    // Wait until the operation completes. This may take up to a minute.
    while (!operation.done) {
      operation = await ai.checkOperation(operation);
      // Sleep for 5 seconds before checking again.
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    if (operation.error) {
      throw new Error('failed to generate video: ' + operation.error.message);
    }
    
    const videoPart = operation.output?.message?.content.find((p) => !!p.media && p.media.contentType?.startsWith('video/'));
    
    if (!videoPart || !videoPart.media) {
      throw new Error('Failed to find the generated video');
    }

    // The media URL from Veo is temporary and needs to be fetched.
    // We will convert it to a data URI to send to the client.
    const fetch = (await import('node-fetch')).default;
    const videoDownloadResponse = await fetch(
        `${videoPart.media.url}&key=${process.env.GEMINI_API_KEY}`
    );

    if (
        !videoDownloadResponse ||
        videoDownloadResponse.status !== 200 ||
        !videoDownloadResponse.body
    ) {
        throw new Error('Failed to fetch video from temporary URL');
    }

    const buffer = await videoDownloadResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = videoPart.media.contentType || 'video/mp4';

    return {
      videoDataUri: `data:${contentType};base64,${base64}`,
    };
  }
);

    