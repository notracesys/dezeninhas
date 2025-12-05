import { Button } from '@/components/ui/button';
import { Clover } from 'lucide-react';
import Link from 'next/link';
import { BackgroundDecorations } from '@/components/background-decorations';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <BackgroundDecorations />
      <div className="flex min-h-[90vh] flex-col items-center justify-center p-4 text-center">
        <main>
          <Clover className="mx-auto h-24 w-24 text-primary" />
          <h1 className="mt-4 text-5xl font-bold uppercase tracking-wider text-primary md:text-7xl">
            Mega da Virada
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-primary/80 md:text-3xl">
            Aumente Suas Chances
          </h2>
          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Este site consiste em números que foram estudados e gerados por
            especialistas.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 transform rounded-lg bg-primary px-12 py-8 text-xl font-bold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:bg-primary/90"
          >
            <Link href="/pricing">QUERO GERAR MEUS NÚMEROS</Link>
          </Button>
        </main>
      </div>
      <footer className="w-full bg-white p-4 pb-8">
        <div className="mx-auto max-w-3xl text-center text-slate-500">
          <h3 className="font-bold text-sm mb-2">Aviso Importante</h3>
          <p className="text-xs">
            Os números que você obterá em nosso sistema não são uma garantia de
            premiação. Eles são sugestões geradas com base em resoluções
            matemáticas, raciocínio lógico e um profundo estudo estatístico sobre
            todos os resultados históricos da Mega-Sena, realizado por
            especialistas. Nosso objetivo é aumentar suas probabilidades, não
            garantir o resultado. Jogue com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
}
