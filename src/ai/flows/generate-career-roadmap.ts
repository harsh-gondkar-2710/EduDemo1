
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
    .describe('A detailed explanation of the skill and its importance for the role.'),
});

const CourseRecommendationSchema = z.object({
  title: z.string().describe('The full title of the recommended course.'),
  provider: z.string().describe('The platform or institution offering the course (e.g., Coursera, Udemy).'),
});

const CareerRoadmapSchema = z.object({
  jobRole: z.string().describe('The job role for which the roadmap is generated.'),
  roadmap: z
    .array(CareerRoadmapStepSchema)
    .describe('A list of steps to follow to achieve the career goal.'),
  recommendedCourses: z
    .array(CourseRecommendationSchema)
    .describe('A list of 3-5 highly recommended courses for the overall job role.'),
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
  
  For each step in the 'roadmap' array, provide:
  1.  'skill': A clear and concise name for the skill or technology (e.g., "Learn HTML & CSS", "Master React.js", "Understand Data Structures").
  2.  'description': A detailed paragraph explaining what the skill is, why it's crucial for a "{{{jobRole}}}", and what a beginner should focus on. Do NOT recommend any courses in this description.

  After creating the roadmap, provide a list of 3-5 highly recommended online courses for the overall career goal in the 'recommendedCourses' array.
  For each course in this list, provide:
  1. 'title': The full, official name of the course.
  2. 'provider': The name of the platform or institution that offers it (e.g., "Coursera", "Udemy", "DeepLearning.AI", "Google").

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
