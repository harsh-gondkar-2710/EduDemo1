'use server';
/**
 * @fileOverview Flow for generating a career roadmap for a given job role.
 *
 * - generateCareerRoadmap - Function to generate the roadmap.
 * - GenerateCareerRoadmapInput - Input type for the function.
 * - CareerRoadmap - Output type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCareerRoadmapInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is interested in.'),
});
export type GenerateCareerRoadmapInput = z.infer<
  typeof GenerateCareerRoadmapInputSchema
>;

const CareerRoadmapStepSchema = z.object({
  skill: z.string().describe('A specific skill or technology to learn.'),
  description: z
    .string()
    .describe('A brief explanation of the skill and its importance for the role.'),
});

const CareerRoadmapSchema = z.object({
  jobRole: z.string().describe('The job role for which the roadmap is generated.'),
  roadmap: z
    .array(CareerRoadmapStepSchema)
    .describe('A list of steps to follow to achieve the career goal.'),
});
export type CareerRoadmap = z.infer<typeof CareerRoadmapSchema>;

export async function generateCareerRoadmap(
  input: GenerateCareerRoadmapInput
): Promise<CareerRoadmap> {
  return generateCareerRoadmapFlow(input);
}

const careerRoadmapPrompt = ai.definePrompt({
  name: 'careerRoadmapPrompt',
  input: { schema: GenerateCareerRoadmapInputSchema },
  output: { schema: CareerRoadmapSchema },
  prompt: `You are an expert career advisor. Your task is to create a detailed, step-by-step learning roadmap for a user aspiring to become a "{{{jobRole}}}".

  The roadmap should consist of 8-10 logical steps, starting from foundational knowledge and progressing to more advanced skills.
  
  For each step, provide:
  1.  'skill': A clear and concise name for the skill or technology (e.g., "Learn HTML & CSS", "Master React.js", "Understand Data Structures").
  2.  'description': A short paragraph explaining what the skill is and why it's crucial for a "{{{jobRole}}}".

  The roadmap should be practical and actionable for a beginner. Ensure the final output is a JSON object matching the provided schema.
  `,
});

const generateCareerRoadmapFlow = ai.defineFlow(
  {
    name: 'generateCareerRoadmapFlow',
    inputSchema: GenerateCareerRoadmapInputSchema,
    outputSchema: CareerRoadmapSchema,
  },
  async (input) => {
    const { output } = await careerRoadmapPrompt(input);
    return output!;
  }
);
