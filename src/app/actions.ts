"use server";

import { generateStatisticallySuggestedNumbers } from "@/ai/flows/generate-statistically-suggested-numbers";

export interface GenerateNumbersInput {
  numbersPerCombination: number;
}

export interface GenerateNumbersOutput {
  numberCombinations: number[][];
}

export async function generateNumbersAction(
  input: GenerateNumbersInput
): Promise<{ success: true; data: GenerateNumbersOutput } | { success: false; error: string }> {
  try {
    const { numbersPerCombination } = input;

    if (numbersPerCombination < 6 || numbersPerCombination > 15) {
       return { success: false, error: "A quantidade de dezenas deve ser entre 6 e 15." };
    }
    
    // Call the actual AI flow
    const result = await generateStatisticallySuggestedNumbers({
      numbersPerCombination,
    });
    
    // Ensure the result has the expected structure
    if (!result || !result.numberCombinations || !Array.isArray(result.numberCombinations)) {
        throw new Error("A IA retornou uma resposta em formato inválido.");
    }
    
    return { success: true, data: result };

  } catch (error: any) {
    console.error("AI Generation Error in action:", error);
    return { success: false, error: error.message || "Falha ao gerar dezenas com a IA." };
  }
}
