"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";

const loadingTexts = [
  "Conectando ao sistema...",
  "Analisando resultados históricos da loteria...",
  "Cruzando dados estatísticos...",
  "Aplicando algoritmos de probabilidade...",
  "Buscando padrões e tendências...",
  "Gerando combinações com maiores chances...",
  "Verificando dezenas...",
  "Finalizando e preparando seus números!",
];

interface GeneratingLoaderProps {
  onComplete: () => void;
}

export function GeneratingLoader({ onComplete }: GeneratingLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(loadingTexts[0]);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentText(prevText => {
        const currentIndex = loadingTexts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 1000); // Muda o texto a cada 1 segundo

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          return 100;
        }
        return prev + 4; // Aumenta 4% a cada 200ms para um total de 5s
      });
    }, 200);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      // Chame onComplete aqui para evitar o erro de renderização
      const timer = setTimeout(() => onComplete(), 50); // Pequeno atraso para garantir que o estado seja atualizado
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);


  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Gerando seus números...</h2>
        <Progress value={progress} className="w-full h-4 mb-4" />
        <p className="text-lg text-slate-200 transition-opacity duration-500">{currentText}</p>
      </div>
    </div>
  );
}
