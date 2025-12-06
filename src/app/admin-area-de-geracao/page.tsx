"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BlockedNumbersCard } from "@/components/blocked-numbers-card";
import { GeneratingLoader } from "@/components/generating-loader";
import { Switch } from "@/components/ui/switch";

interface GenerateNumbersInput {
  numbersPerCombination: number;
}

interface GenerateNumbersOutput {
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

async function generateNumbersAction(
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

export default function GenerationAreaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [numbersPerCombination, setNumbersPerCombination] = useState("6");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<GenerateNumbersOutput | null>(null);
  
  // States for the "hacker" switches (for visual purposes only)
  const [sequenceInjection, setSequenceInjection] = useState(true);
  const [randomBypass, setRandomBypass] = useState(true);
  const [entropyScan, setEntropyScan] = useState(false);

  useEffect(() => {
    if (isGenerating && generatedNumbers) {
      const timer = setTimeout(() => {
        router.push(`/results?numbers=${JSON.stringify(generatedNumbers.numberCombinations)}`);
      }, 5500); // Same duration as the loader
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generatedNumbers, router]);

  const startGenerationProcess = async () => {
    setIsGenerating(true);

    const result = await generateNumbersAction({
      numbersPerCombination: parseInt(numbersPerCombination, 10),
    });

    if (result.success && result.data?.numberCombinations) {
      setGeneratedNumbers(result.data);
      // The useEffect for navigation will handle the redirect
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao Gerar Dezenas",
        description: result.error || "Ocorreu um erro. Tente novamente mais tarde.",
      });
      setIsGenerating(false); // Stop generation process on error
    }
  };

  return (
    <>
      {isGenerating && <GeneratingLoader />}
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary))] to-green-950 text-white p-4 sm:p-8">
        <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mt-12 text-white">Área de Geração</h1>
          <p className="text-lg text-slate-200 mt-2">Utilize os algoritmos avançados para gerar suas dezenas.</p>
          
          <div className="relative my-8 w-full max-w-sm -rotate-3">
             <BlockedNumbersCard />
          </div>
          
          <div className="w-full space-y-6 bg-white/90 p-6 rounded-lg shadow-xl text-black">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="numbersPerGame" className="text-left block mb-2 font-semibold text-slate-700">Dezenas por jogo</Label>
                <Select value={numbersPerCombination} onValueChange={setNumbersPerCombination}>
                  <SelectTrigger id="numbersPerGame" className="w-full text-black">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 6).map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} dezenas
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-md font-semibold text-slate-800 text-center">Protocolos Avançados</h3>
              <div className="flex items-center justify-between">
                <Label htmlFor="sequence-injection" className="text-sm text-slate-600">Injeção de Sequência Otimizada (ISO)</Label>
                <Switch id="sequence-injection" checked={sequenceInjection} onCheckedChange={setSequenceInjection} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="random-bypass" className="text-sm text-slate-600">Bypass de Aleatoriedade Padrão</Label>
                <Switch id="random-bypass" checked={randomBypass} onCheckedChange={setRandomBypass} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="entropy-scan" className="flex items-center gap-2 text-sm text-slate-600">
                  Varredura de Entropia de Sorteio
                </Label>
                <Switch id="entropy-scan" checked={entropyScan} onCheckedChange={setEntropyScan} />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 rounded-lg shadow-md"
              onClick={startGenerationProcess}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <><Ticket className="mr-2" /> GERAR DEZENAS</>}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
