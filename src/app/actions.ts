"use server";

import { generateStatisticallySuggestedNumbers } from "@/ai/flows/generate-statistically-suggested-numbers";
import type { GenerateStatisticallySuggestedNumbersInput } from "@/ai/flows/generate-statistically-suggested-numbers";

export async function generateNumbersAction(
  input: GenerateStatisticallySuggestedNumbersInput
) {
  try {
    const result = await generateStatisticallySuggestedNumbers(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Falha ao gerar dezenas." };
  }
}
