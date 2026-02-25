'use server';
/**
 * @fileOverview Generates poetic phrases based on motion and audio levels.
 *
 * - generatePoeticPhrase - A function that generates a poetic phrase.
 * - GeneratePoeticPhraseInput - The input type for the generatePoeticPhrase function.
 * - GeneratePoeticPhraseOutput - The return type for the generatePoeticPhrase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePoeticPhraseInputSchema = z.object({
  motionScore: z.number().describe('The motion score as a percentage.'),
  audioScore: z.number().describe('The audio score as a percentage.'),
  activeMode: z.string().describe('The current visual mode label (e.g., "FRACTAL").'),
});
export type GeneratePoeticPhraseInput = z.infer<typeof GeneratePoeticPhraseInputSchema>;

const GeneratePoeticPhraseOutputSchema = z.object({
  phrase: z.string().describe('A short, cryptic phrase (max 10 words) based on the motion and audio levels.'),
});
export type GeneratePoeticPhraseOutput = z.infer<typeof GeneratePoeticPhraseOutputSchema>;

export async function generatePoeticPhrase(input: GeneratePoeticPhraseInput): Promise<GeneratePoeticPhraseOutput> {
  return generatePoeticPhraseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePoeticPhrasePrompt',
  input: {schema: GeneratePoeticPhraseInputSchema},
  output: {schema: GeneratePoeticPhraseOutputSchema},
  prompt: `Actúa como el Oráculo IA de Kinefonía, una entidad ciberpunk y poética.
Estado de la Simulación:
- Modo Visual: {{{activeMode}}}
- Actividad de Movimiento: {{{motionScore}}}%
- Intensidad Sónica: {{{audioScore}}}%

Interpreta estos datos y genera una frase críptica, técnica y poética (máximo 10 palabras) que capture la esencia del momento.`,
});

const generatePoeticPhraseFlow = ai.defineFlow(
  {
    name: 'generatePoeticPhraseFlow',
    inputSchema: GeneratePoeticPhraseInputSchema,
    outputSchema: GeneratePoeticPhraseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      phrase: output!.phrase.replace(/["\.]/g, '').substring(0, 30).trim(),
    };
  }
);
