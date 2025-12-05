"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2, Info, Ticket } from "lucide-react";
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
import { generateNumbersAction, type GenerateNumbersOutput } from "@/app/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockedNumbersCard } from "@/components/blocked-numbers-card";
import { GeneratingLoader } from "@/components/generating-loader";
import { useFirestore } from "@/firebase";
import { collection, query, where, getDocs, writeBatch } from "firebase/firestore";

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();
  const [numbersPerCombination, setNumbersPerCombination] = useState("6");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<GenerateNumbersOutput | null>(null);
  const [isCodeValid, setIsCodeValid] = useState(false);

  useEffect(() => {
    if (isGenerating && generatedNumbers) {
      const timer = setTimeout(() => {
        router.push(`/results?numbers=${JSON.stringify(generatedNumbers.numberCombinations)}`);
      }, 5500); // Same duration as the loader
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generatedNumbers, router]);

  const validateAccessCode = async (code: string) => {
    if (!code) {
      setIsCodeValid(false);
      return;
    }
    const accessCodesRef = collection(firestore, "access_codes");
    const q = query(accessCodesRef, where("code", "==", code.toUpperCase().trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setIsCodeValid(false);
      return;
    }

    const accessCodeDoc = querySnapshot.docs[0];
    if (accessCodeDoc.data().isUsed) {
      setIsCodeValid(false);
      toast({
        variant: "destructive",
        title: "Código Já Utilizado",
        description: "Este código de acesso já foi utilizado para gerar dezenas.",
      });
    } else {
      setIsCodeValid(true);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      validateAccessCode(accessCode);
    }, 500);
    return () => clearTimeout(debounce);
  }, [accessCode, firestore]);

  const startGenerationProcess = async () => {
    setIsLoading(true);

    const accessCodesRef = collection(firestore, "access_codes");
    const q = query(accessCodesRef, where("code", "==", accessCode.toUpperCase().trim()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      toast({
        variant: "destructive",
        title: "Código de Acesso Inválido",
        description: "Por favor, verifique seu código e tente novamente.",
      });
      setIsLoading(false);
      return;
    }

    const accessCodeDoc = querySnapshot.docs[0];
    if (accessCodeDoc.data().isUsed) {
      toast({
        variant: "destructive",
        title: "Código Já Utilizado",
        description: "Este código não pode ser usado novamente.",
      });
      setIsLoading(false);
      return;
    }

    const result = await generateNumbersAction({
      numbersPerCombination: parseInt(numbersPerCombination, 10),
    });

    if (result.success && result.data?.numberCombinations) {
      try {
        const batch = writeBatch(firestore);
        batch.update(accessCodeDoc.ref, { isUsed: true });
        await batch.commit();
        
        setGeneratedNumbers(result.data);
        setIsGenerating(true);

      } catch (error) {
         console.error("Error updating access code: ", error);
         toast({
            variant: "destructive",
            title: "Erro ao validar código",
            description: "Não foi possível marcar o código como utilizado. Tente novamente.",
         });
         setIsLoading(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao gerar dezenas",
        description: result.error || "Ocorreu um erro. Tente novamente mais tarde.",
      });
      setIsLoading(false); 
    }
  };
  
  const isButtonDisabled = isLoading || !isCodeValid;

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
          <p className="text-lg text-slate-200">Apenas uma única liberação por jogo.</p>
          
          <div className="relative my-8 w-full max-w-sm -rotate-3">
             <BlockedNumbersCard />
          </div>
          
          <div className="flex flex-col items-center space-y-2 mb-8">
            <p className="text-lg font-bold text-white">Libere para ver as dezenas reais</p>
            <p className="text-sm text-slate-200">Acesso imediato após pagamento</p>
          </div>

          <div className="w-full space-y-6 bg-white/90 p-6 rounded-lg shadow-xl">
            <Button
              size="lg"
              className="animate-sheen w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xl py-7 rounded-lg shadow-lg"
              asChild
            >
              <Link href="https://pay.kirvano.com/415dda1a-220b-4514-983c-c51283359309">LIBERAR ACESSO</Link>
            </Button>
            
            <div className="text-center text-sm text-slate-500">
              <p>Já tem um código? Insira abaixo para gerar.</p>
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
                <Label htmlFor="access-code" className="text-left block font-semibold text-slate-700">Insira seu código de acesso</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={16} className="text-gray-500 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-gray-800 text-white border-gray-700">
                    <p>Você receberá seu código de acesso por e-mail após a confirmação do pagamento.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <Input 
                  id="access-code" 
                  placeholder="Seu código aqui..." 
                  className="flex-grow text-black" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  aria-label="Código de Acesso"
                />
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg py-6 rounded-lg shadow-md"
              onClick={startGenerationProcess}
              disabled={isButtonDisabled}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><Ticket className="mr-2" /> GERAR DEZENAS</>}
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
