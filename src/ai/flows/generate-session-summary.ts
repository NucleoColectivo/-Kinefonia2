'use server';

/**
 * @fileOverview Generates a short summary of a Kinefonia session based on the session logs.
 *
 * - generateSessionSummary - A function that generates the session summary.
 * - GenerateSessionSummaryInput - The input type for the generateSessionSummary function.
 * - GenerateSessionSummaryOutput - The return type for the generateSessionSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSessionSummaryInputSchema = z.object({
  sessionLogs: z.array(
    z.object({
      time: z.string(),
      text: z.string(),
    })
  ).describe('An array of session logs, each with a timestamp and text.'),
});
export type GenerateSessionSummaryInput = z.infer<typeof GenerateSessionSummaryInputSchema>;

const GenerateSessionSummaryOutputSchema = z.object({
  summary: z.string().describe('A short summary of the Kinefonia session.'),
});
export type GenerateSessionSummaryOutput = z.infer<typeof GenerateSessionSummaryOutputSchema>;

export async function generateSessionSummary(input: GenerateSessionSummaryInput): Promise<GenerateSessionSummaryOutput> {
  return generateSessionSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSessionSummaryPrompt',
  input: {schema: GenerateSessionSummaryInputSchema},
  output: {schema: GenerateSessionSummaryOutputSchema},
  prompt: `You are an AI assistant that summarizes sessions.  Given the logs below, write a concise summary (max 30 words) describing the session. Focus on key events and any notable patterns or trends.

Session Logs:
{{#each sessionLogs}}
  {{time}}: {{text}}
{{/each}}
`,
});

const generateSessionSummaryFlow = ai.defineFlow(
  {
    name: 'generateSessionSummaryFlow',
    inputSchema: GenerateSessionSummaryInputSchema,
    outputSchema: GenerateSessionSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      summary: output!.summary,
    };
  }
);
