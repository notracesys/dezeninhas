'use server';
/**
 * @fileOverview Generates statistically suggested number combinations for the Mega da Virada draw.
 *
 * - generateStatisticallySuggestedNumbers - A function that generates statistically suggested number combinations.
 * - GenerateStatisticallySuggestedNumbersInput - The input type for the generateStatisticallySuggestedNumbers function.
 * - GenerateStatisticallySuggestedNumbersOutput - The return type for the generateStatisticallySuggestedNumbers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateStatisticallySuggestedNumbersInputSchema = z.object({
  numberOfCombinations: z
    .number()
    .min(1)
    .max(10)
    .describe('The number of number combinations to generate.'),
});
export type GenerateStatisticallySuggestedNumbersInput = z.infer<
  typeof GenerateStatisticallySuggestedNumbersInputSchema
>;

const GenerateStatisticallySuggestedNumbersOutputSchema = z.object({
  numberCombinations: z
    .array(z.array(z.number().min(1).max(60)).length(6))
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

  Based on statistical analysis of past Mega da Virada draws, generate {{{numberOfCombinations}}} unique combinations of 6 numbers between 1 and 60. Return the combinations as a JSON array of arrays.

  The numbers in each combination should be sorted in ascending order.
  The combinations must be distinct; do not return the same combination more than once.
  Each combination must be an array of 6 numbers. No duplicates allowed in a single combination.
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
