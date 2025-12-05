"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Clover } from "lucide-react";
import { cn } from "@/lib/utils";

function LotteryCard({ combination, index }: { combination: number[], index: number }) {
  const allNumbers = Array.from({ length: 60 }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transform transition-transform hover:scale-105">
      <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Clover className="w-6 h-6 opacity-80" />
            <h3 className="font-bold text-lg">
                Combinação #{index + 1}
            </h3>
        </div>
        <span className="font-headline text-xl">Números da Virada</span>
      </div>
      <div className="p-4 grid grid-cols-10 gap-1.5 md:gap-2">
        {allNumbers.map((number) => {
          const isSelected = combination.includes(number);
          return (
            <div
              key={number}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                isSelected
                  ? "bg-primary border-primary text-primary-foreground shadow-md"
                  : "bg-gray-100 border-gray-300 text-gray-400"
              )}
            >
              {String(number).padStart(2, '0')}
            </div>
          );
        })}
      </div>
    </div>
  );
}


function ResultsDisplay() {
  const searchParams = useSearchParams();
  const numbersParam = searchParams.get("numbers");
  let combinations: number[][] = [];

  try {
    if (numbersParam) {
      combinations = JSON.parse(numbersParam);
    }
  } catch (error) {
    console.error("Failed to parse numbers:", error);
  }

  if (combinations.length === 0) {
    return (
      <div className="text-center">
        <p className="text-xl text-destructive">Não foi possível carregar as dezenas.</p>
        <p className="mt-2 text-muted-foreground">Por favor, tente gerar as dezenas novamente.</p>
        <Button asChild className="mt-4">
          <Link href="/pricing">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-5xl shadow-2xl bg-slate-50/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary">Suas Dezenas da Sorte!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-8">Aqui estão suas combinações geradas por especialistas. Boa sorte!</p>
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {combinations.map((combo, index) => (
             <LotteryCard key={index} combination={combo} index={index} />
          ))}
        </div>
        <div className="text-center mt-12 flex justify-center gap-4">
          <Button asChild size="lg" variant="outline">
            <Link href="/">Voltar para o Início</Link>
          </Button>
          <Button asChild size="lg">
            <Link href="/pricing">Gerar Novo Jogo</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResultsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 md:p-8">
      <Suspense fallback={<div className="text-center">Carregando resultados...</div>}>
        <ResultsDisplay />
      </Suspense>
    </main>
  );
}
