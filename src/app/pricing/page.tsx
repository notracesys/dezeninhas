"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Lock, Loader2, Info } from "lucide-react";
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
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Este código de acesso é apenas para fins de demonstração.
// Em um aplicativo real, a validação seria feita no backend após um pagamento bem-sucedido.
const ACCESS_CODE = "MEGA2024";

export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [numberOfCombinations, setNumberOfCombinations] = useState("1");
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const lotteryTicketImage = PlaceHolderImages.find(p => p.id === 'lottery-ticket');

  const handleLiberarAcesso = async () => {
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
      numberOfCombinations: parseInt(numberOfCombinations, 10),
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
      <div className="min-h-screen bg-gradient-to-br from-primary/90 via-primary to-green-800 text-white p-4 sm:p-8">
        <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </Link>
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mt-12">Acesso aos Números da Virada</h1>
          <p className="text-5xl sm:text-7xl font-bold text-accent my-4">
            R$ 14,90
          </p>
          <p className="text-lg text-gray-300">Apenas uma única liberação por jogo.</p>
          
          <div className="relative my-8 w-full max-w-md">
            {lotteryTicketImage && (
               <Image
                src={lotteryTicketImage.imageUrl}
                alt={lotteryTicketImage.description}
                width={600}
                height={350}
                data-ai-hint={lotteryTicketImage.imageHint}
                className="rounded-xl shadow-2xl blur-sm"
              />
            )}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 rounded-xl">
              <Lock size={64} className="text-white/50" />
              <p className="mt-4 font-semibold">Conteúdo bloqueado</p>
              <p className="text-sm text-gray-200">Libere para ver os números reais</p>
              <p className="text-sm text-gray-200">Acesso imediato após pagamento</p>
            </div>
          </div>

          <Card className="w-full bg-white/10 border-white/20 backdrop-blur-sm text-white">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="combinations" className="text-left block mb-2 font-semibold">Quantas combinações deseja gerar?</Label>
                  <p className="text-sm text-gray-300 mb-2 text-left">Cada combinação contém 6 números.</p>
                  <Select value={numberOfCombinations} onValueChange={setNumberOfCombinations}>
                    <SelectTrigger id="combinations" className="w-full text-black">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num} {num > 1 ? 'combinações' : 'combinação'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="access-code" className="text-left block font-semibold">Insira seu código de acesso</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info size={16} className="text-gray-300 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs bg-gray-800 text-white border-gray-700">
                        <p>Você receberá um código de acesso após o pagamento. Para fins de demonstração, use o código: <strong className="text-accent">MEGA2024</strong></p>
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
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold text-xl py-7 rounded-lg shadow-lg"
                  onClick={handleLiberarAcesso}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin" /> : "LIBERAR ACESSO"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 space-y-3 text-left w-full max-w-md">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent h-5 w-5 shrink-0" />
              <p>Resultados gerados por especialistas</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent h-5 w-5 shrink-0" />
              <p>Números exclusivos que não aparecem gratuitamente</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="text-accent h-5 w-5 shrink-0" />
              <p>Libere o acesso imediato</p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
