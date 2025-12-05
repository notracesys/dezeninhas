"use client";

import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

interface Decoration {
  id: number;
  Component: typeof DollarSign;
  style: React.CSSProperties;
}

export function BackgroundDecorations() {
  const [decorations, setDecorations] = useState<Decoration[]>([]);

  useEffect(() => {
    const generateDecorations = () => {
      const newDecorations: Decoration[] = [];
      const numDecorations = 30; // Aumentar a quantidade para compensar o tamanho menor

      for (let i = 0; i < numDecorations; i++) {
        const component = DollarSign;
        const size = Math.random() * 15 + 10; // Deixar bem pequeno
        const duration = Math.random() * 15 + 10; // Duração da animação
        const delay = Math.random() * -duration; // Começar em pontos diferentes
        newDecorations.push({
          id: i,
          Component: component,
          style: {
            position: 'absolute',
            bottom: '-20%', // Começar de fora da tela, na parte de baixo
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `rise ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            opacity: Math.random() * 0.3, // Opacidade variada
          },
        });
      }
      setDecorations(newDecorations);
    };

    generateDecorations();
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
      <style>
        {`
          @keyframes rise {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 0.2;
            }
            100% {
              transform: translateY(-120vh) rotate(360deg); // Mover para cima, para fora da tela
              opacity: 0;
            }
          }
        `}
      </style>
      {decorations.map(({ id, Component, style }) => (
        <Component key={id} style={style} className="text-primary" />
      ))}
    </div>
  );
}
