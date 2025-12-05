"use client";

import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const selectedNumbers = [4, 8, 15, 16, 23, 42, 5, 12, 29, 33, 48, 55];

export function BlockedNumbersCard() {
  return (
    <div className="relative w-full rounded-2xl border-4 border-gray-200 bg-white p-4 shadow-2xl">
      <div className="relative">
        <div className="grid grid-cols-10 gap-1 md:gap-2">
          {Array.from({ length: 60 }, (_, i) => i + 1).map((number) => {
            const isSelected = selectedNumbers.includes(number);
            return (
              <div
                key={number}
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold",
                  isSelected
                    ? "border-green-800 bg-green-800 text-white"
                    : "border-gray-300 text-gray-400"
                )}
              >
                {isSelected ? "?" : String(number).padStart(2, "0")}
              </div>
            );
          })}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <Lock className="h-24 w-24 text-gray-800/60" />
        </div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold uppercase tracking-wider text-green-800">
          Conteúdo Bloqueado
        </h3>
      </div>
    </div>
  );
}
