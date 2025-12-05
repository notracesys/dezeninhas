"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
    <Card className="w-full max-w-4xl shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Ticket size={40} />
        </div>
        <CardTitle className="text-3xl font-bold text-primary">Suas Dezenas da Sorte!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-8">Aqui estão suas combinações geradas por especialistas. Boa sorte!</p>
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {combinations.map((combo, index) => (
            <div key={index} className="bg-secondary/50 rounded-lg p-4 text-center border">
              <h3 className="font-semibold text-lg text-secondary-foreground mb-3">
                Combinação #{index + 1}
              </h3>
              <ScrollArea className="w-full whitespace-nowrap rounded-md">
                <div className="flex w-max space-x-2 p-2 justify-center">
                  {combo.map((num) => (
                    <div
                      key={num}
                      className="flex items-center justify-center h-10 w-10 flex-shrink-0 bg-primary text-primary-foreground rounded-full font-bold text-base shadow-md"
                    >
                      {String(num).padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Button asChild>
            <Link href="/">Voltar para o Início</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResultsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <Suspense fallback={<div className="text-center">Carregando resultados...</div>}>
        <ResultsDisplay />
      </Suspense>
    </main>
  );
}
