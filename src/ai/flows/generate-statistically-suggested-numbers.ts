'use server';
/**
 * @fileOverview Generates a statistically suggested number combination for the Mega da Virada draw.
 *
 * - generateStatisticallySuggestedNumbers - A function that generates a statistically suggested number combination.
 * - GenerateStatisticallySuggestedNumbersInput - The input type for the generateStatisticallySuggestedNumbers function.
 * - GenerateStatisticallySuggestedNumbersOutput - The return type for the generateStatisticallySuggestedNumbers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStatisticallySuggestedNumbersInputSchema = z.object({
  numbersPerCombination: z
    .number()
    .min(6)
    .max(15)
    .describe('The quantity of numbers per combination.'),
});
export type GenerateStatisticallySuggestedNumbersInput = z.infer<
  typeof GenerateStatisticallySuggestedNumbersInputSchema
>;

const GenerateStatisticallySuggestedNumbersOutputSchema = z.object({
  numberCombinations: z
    .array(z.array(z.number().min(1).max(60)))
    .describe('An array of number combinations.'),
});
export type GenerateStatisticallySuggestedNumbersOutput = z.infer<
  typeof GenerateStatisticallySuggestedNumbersOutputSchema
>;

export async function generateStatisticallySuggestedNumbers(
  input: GenerateStatisticallySuggestedNumbersInput
): Promise<GenerateStatisticallySuggestedNumbersOutput> {
  return generateStatisticallySuggestedNumbersFlow(input);
}

const generateNumbersPrompt = ai.definePrompt({
  name: 'generateNumbersPrompt',
  input: {schema: GenerateStatisticallySuggestedNumbersInputSchema},
  output: {schema: GenerateStatisticallySuggestedNumbersOutputSchema},
  prompt: `You are an expert lottery number generator.

  Based on statistical analysis of past Mega da Virada draws, generate 1 unique combination of {{{numbersPerCombination}}} numbers between 1 and 60. Return the combination as a JSON array of arrays.

  The numbers in the combination should be sorted in ascending order.
  The combination must be an array of {{{numbersPerCombination}}} numbers. No duplicates allowed in the combination.
  `,
});

const generateStatisticallySuggestedNumbersFlow = ai.defineFlow(
  {
    name: 'generateStatisticallySuggestedNumbersFlow',
    inputSchema: GenerateStatisticallySuggestedNumbersInputSchema,
    outputSchema: GenerateStatisticallySuggestedNumbersOutputSchema,
  },
  async input => {
    const {output} = await generateNumbersPrompt(input);
    return output!;
  }
);
