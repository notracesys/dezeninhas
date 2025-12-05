"use server";

export interface GenerateNumbersInput {
  numbersPerCombination: number;
}

export interface GenerateNumbersOutput {
  numberCombinations: number[][];
}

function generateUniqueRandomNumbers(count: number, min: number, max: number): number[] {
  if (count > max - min + 1) {
    throw new Error("Não é possível gerar mais números únicos do que o intervalo disponível.");
  }
  
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

    if (numbersPerCombination < 6 || numbersPerCombination > 20) {
       return { success: false, error: "A quantidade de dezenas deve ser entre 6 e 20." };
    }

    const combination = generateUniqueRandomNumbers(numbersPerCombination, 1, 60);
    
    const result: GenerateNumbersOutput = {
      numberCombinations: [combination],
    };

    return { success: true, data: result };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || "Falha ao gerar dezenas." };
  }
}
