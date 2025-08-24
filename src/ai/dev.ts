import { config } from 'dotenv';
config();

import '@/ai/flows/generate-personalized-recommendations.ts';
import '@/ai/flows/dynamically-adjust-difficulty.ts';
import '@/ai/flows/generate-lesson-plan.ts';
import '@/ai/flows/generate-practice-question.ts';
import '@/ai/flows/language-tutor.ts';
import '@/ai/flows/grade-essay.ts';
