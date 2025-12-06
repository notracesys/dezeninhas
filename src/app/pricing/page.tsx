"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, Info, Ticket, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockedNumbersCard } from "@/components/blocked-numbers-card";
import { GeneratingLoader } from "@/components/generating-loader";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, writeBatch, serverTimestamp } from "firebase/firestore";

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


export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [numbersPerCombination, setNumbersPerCombination] = useState("6");
  const [accessCode, setAccessCode] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<GenerateNumbersOutput | null>(null);
  
  useEffect(() => {
    // Reset verification if the code changes
    setIsCodeVerified(false);
  }, [accessCode]);

  useEffect(() => {
    if (isGenerating && generatedNumbers) {
      const timer = setTimeout(() => {
        router.push(`/results?numbers=${JSON.stringify(generatedNumbers.numberCombinations)}`);
      }, 5500); // Same duration as the loader
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generatedNumbers, router]);

  const handleVerifyCode = async () => {
    if (!firestore || !accessCode) return;

    setIsVerifyingCode(true);
    setIsCodeVerified(false);

    const accessCodesRef = collection(firestore, "access_codes");
    const q = query(accessCodesRef, where("code", "==", accessCode.toUpperCase().trim()));

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          variant: "destructive",
          title: "Código Inválido",
          description: "O código de acesso inserido não foi encontrado.",
        });
        return;
      }

      const accessCodeDoc = querySnapshot.docs[0];
      if (accessCodeDoc.data().isUsed) {
        toast({
          variant: "destructive",
          title: "Código Já Utilizado",
          description: "Este código de acesso já foi resgatado.",
        });
        return;
      }

      // If we reach here, the code is valid and unused
      setIsCodeVerified(true);
      toast({
        title: "Código Válido!",
        description: "Seu código foi verificado com sucesso.",
        className: "bg-green-600 text-white",
      });

    } catch (error) {
      console.error("Error validating access code:", error);
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Não foi possível validar o código. Tente novamente.",
      });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const startGenerationProcess = async () => {
    // Final check to ensure code is verified before proceeding
    if (!isCodeVerified || !firestore) {
      toast({
        variant: "destructive",
        title: "Código Não Verificado",
        description: "Por favor, verifique seu código de acesso antes de gerar as dezenas.",
      });
      return;
    }

    setIsGenerating(true); // Changed from setIsLoading to setIsGenerating

    const accessCodesRef = collection(firestore, "access_codes");
    const q = query(accessCodesRef, where("code", "==", accessCode.toUpperCase().trim()));
    const querySnapshot = await getDocs(q);
    const accessCodeDoc = querySnapshot.docs[0];

    // Use the local generation action
    const result = await generateNumbersAction({
      numbersPerCombination: parseInt(numbersPerCombination, 10),
    });

    if (result.success && result.data?.numberCombinations) {
      try {
        const batch = writeBatch(firestore);
        batch.update(accessCodeDoc.ref, { isUsed: true, usedAt: serverTimestamp() });
        await batch.commit();
        
        setGeneratedNumbers(result.data);
        // The useEffect for navigation will handle the redirect

      } catch (error) {
         console.error("Error updating access code: ", error);
         toast({
            variant: "destructive",
            title: "Erro ao Finalizar",
            description: "Não foi possível marcar o código como utilizado. Tente novamente.",
         });
         setIsGenerating(false); // Stop generation process on error
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao Gerar Dezenas",
        description: result.error || "Ocorreu um erro. Tente novamente mais tarde.",
      });
      setIsGenerating(false); // Stop generation process on error
    }
  };
  
  const isGenerationButtonDisabled = isGenerating || !isCodeVerified;

  return (
    <TooltipProvider>
      {isGenerating && <GeneratingLoader />}
      <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--primary))] to-green-950 text-white p-4 sm:p-8">
        <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mt-12 text-white">Acesso às Dezenas da Virada</h1>
          <p className="text-5xl sm:text-7xl font-bold text-yellow-400 my-4">
            R$ 14,90
          </p>
          <p className="text-lg text-slate-200">Cada código é válido para gerar <b>um único jogo</b>.</p>
          
          <div className="relative my-8 w-full max-w-sm -rotate-3">
             <BlockedNumbersCard />
          </div>
          
          <div className="flex flex-col items-center space-y-2 mb-8">
            <p className="text-lg font-bold text-white">Libere para ver as dezenas reais</p>
            <p className="text-sm text-slate-200">Acesso imediato após pagamento</p>
          </div>

          <div className="w-full space-y-6 bg-white/90 p-6 rounded-lg shadow-xl">
            <p className="text-slate-700 font-semibold">Para comprar seu código, clique no botão abaixo 👇</p>
            <Button
              size="lg"
              className="animate-sheen w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl py-7 rounded-lg shadow-lg"
              asChild
            >
              <Link href="https://pay.kirvano.com/415dda1a-220b-4514-983c-c51283359309">LIBERAR ACESSO</Link>
            </Button>
            
            <div className="text-center text-sm text-slate-500">
              <p>Já tem um código? Insira e valide-o abaixo para gerar.</p>
            </div>

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

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="access-code" className="text-left block font-semibold text-slate-700">Seu código de acesso</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={16} className="text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-gray-800 text-white border-gray-700">
                    <p>Você receberá seu código de acesso por e-mail após a confirmação do pagamento.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  id="access-code" 
                  placeholder="Seu código aqui..." 
                  className="flex-grow text-black" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  disabled={isVerifyingCode || isCodeVerified}
                  aria-label="Código de Acesso"
                />
                <Button
                  onClick={handleVerifyCode}
                  disabled={isVerifyingCode || !accessCode || isCodeVerified}
                >
                  {isVerifyingCode ? <Loader2 className="animate-spin" /> : <Check />}
                </Button>
              </div>
               <div className="mt-3 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-100 p-2 rounded-md">
                  <AlertTriangle size={28} />
                  <span>O código só pode ser usado <b>uma vez</b>. Para gerar um novo jogo, você precisará de um novo código.</span>
                </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 rounded-lg shadow-md"
              onClick={startGenerationProcess}
              disabled={isGenerationButtonDisabled}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <><Ticket className="mr-2" /> GERAR DEZENAS</>}
            </Button>
          </div>

          <div className="mt-8 space-y-3 text-left w-full text-slate-100">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-white h-5 w-5 shrink-0" />
              <p>Resultados gerados por especialistas</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-white h-5 w-5 shrink-0" />
              <p>Dezenas exclusivas que não aparecem gratuitamente</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-white h-5 w-5 shrink-0" />
              <p>Libere o acesso imediato</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
