"use client";

import { useState } from "react";
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
import { generateNumbersAction } from "@/app/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BlockedNumbersCard } from "@/components/blocked-numbers-card";

// Este código de acesso é apenas para fins de demonstração.
// Em um aplicativo real, a validação seria feita no backend após um pagamento bem-sucedido.
const ACCESS_CODE = "MEGA2024";

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [numbersPerCombination, setNumbersPerCombination] = useState("6");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGenerateNumbers = async () => {
    if (accessCode.trim().toUpperCase() !== ACCESS_CODE) {
      toast({
        variant: "destructive",
        title: "Código de Acesso Inválido",
        description: "Por favor, verifique seu código e tente novamente.",
      });
      return;
    }
    
    setIsLoading(true);
    
    const result = await generateNumbersAction({
      numbersPerCombination: parseInt(numbersPerCombination, 10),
    });

    setIsLoading(false);

    if (result.success && result.data?.numberCombinations) {
      // Passa os números gerados como um parâmetro de busca para a página de resultados.
      router.push(`/results?numbers=${JSON.stringify(result.data.numberCombinations)}`);
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao gerar números",
        description: result.error || "Ocorreu um erro. Tente novamente mais tarde.",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 text-white p-4 sm:p-8">
        <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-white hover:text-gray-200 transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="max-w-md mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mt-12">Acesso aos Números da Virada</h1>
          <p className="text-5xl sm:text-7xl font-bold text-yellow-300 my-4">
            R$ 14,90
          </p>
          <p className="text-lg text-gray-300">Apenas uma única liberação por jogo.</p>
          
          <div className="relative my-8 w-full max-w-sm -rotate-3">
             <BlockedNumbersCard />
          </div>
          
          <div className="flex flex-col items-center space-y-2 mb-8">
            <p className="text-lg font-bold">Libere para ver os números reais</p>
            <p className="text-sm text-gray-200">Acesso imediato após pagamento</p>
          </div>

          <div className="w-full space-y-6">
            <Button
              size="lg"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xl py-7 rounded-lg shadow-lg"
              asChild
            >
              <Link href="#">LIBERAR ACESSO</Link>
            </Button>
            
            <div className="text-center text-sm text-gray-300">
              <p>Já tem um código? Insira abaixo para gerar.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="numbersPerGame" className="text-left block mb-2 font-semibold">Nº por jogo</Label>
                <Select value={numbersPerCombination} onValueChange={setNumbersPerCombination}>
                  <SelectTrigger id="numbersPerGame" className="w-full text-black">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => i + 6).map((num) => (
                      <SelectItem key={num} value={String(num)}>
                        {num} números
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="access-code" className="text-left block font-semibold">Insira seu código de acesso</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info size={16} className="text-gray-300 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-gray-800 text-white border-gray-700">
                    <p>Você receberá seu código de acesso por e-mail após a confirmação do pagamento. Para fins de demonstração, use o código: <strong className="text-yellow-300">MEGA2024</strong></p>
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
              onClick={handleGenerateNumbers}
              disabled={isLoading || accessCode.trim().toUpperCase() !== ACCESS_CODE}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : <><Ticket className="mr-2" /> GERAR NÚMEROS</>}
            </Button>
          </div>

          <div className="mt-8 space-y-3 text-left w-full">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-yellow-300 h-5 w-5 shrink-0" />
              <p>Resultados gerados por especialistas</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-yellow-300 h-5 w-5 shrink-0" />
              <p>Números exclusivos que não aparecem gratuitamente</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-yellow-300 h-5 w-5 shrink-0" />
              <p>Libere o acesso imediato</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
