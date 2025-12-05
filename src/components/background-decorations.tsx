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
      const numDecorations = 20;

      for (let i = 0; i < numDecorations; i++) {
        const component = DollarSign;
        const size = Math.random() * 40 + 20;
        const duration = Math.random() * 20 + 15;
        const delay = Math.random() * -duration;
        newDecorations.push({
          id: i,
          Component: component,
          style: {
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            animation: `float ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            opacity: 0.1,
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
          @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-30px) rotate(180deg); }
            100% { transform: translateY(0px) rotate(360deg); }
          }
        `}
      </style>
      {decorations.map(({ id, Component, style }) => (
        <Component key={id} style={style} className="text-primary" />
      ))}
    </div>
  );
}
