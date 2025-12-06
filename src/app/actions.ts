"use server";

export interface GenerateNumbersInput {
  numbersPerCombination: number;
}

export interface GenerateNumbersOutput {
  numberCombinations: number[][];
}

/**
 * Generates a unique, sorted combination of lottery numbers locally.
 * @param {number} count The number of integers to generate.
 * @param {number} min The minimum possible value.
 * @param {number} max The maximum possible value.
 * @returns {number[]} A sorted array of unique random numbers.
 */
function generateUniqueSortedNumbers(count: number, min: number, max: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(randomNumber);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

export async function generateNumbersAction(
  input: GenerateNumbersInput
): Promise<{ success: true; data: GenerateNumbersOutput } | { success: false; error: string }> {
  try {
    const { numbersPerCombination } = input;

    if (numbersPerCombination < 6 || numbersPerCombination > 15) {
      return { success: false, error: "A quantidade de dezenas deve ser entre 6 e 15." };
    }

    // Generate numbers locally without AI
    const combination = generateUniqueSortedNumbers(numbersPerCombination, 1, 60);
    
    const result: GenerateNumbersOutput = {
      numberCombinations: [combination],
    };

    return { success: true, data: result };

  } catch (error: any) {
    console.error("Local Generation Error in action:", error);
    return { success: false, error: error.message || "Falha ao gerar dezenas localmente." };
  }
}
