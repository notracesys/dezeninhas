import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BackgroundDecorations } from '@/components/background-decorations';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      <div className="absolute inset-0 z-0 h-full w-full"></div>
      <BackgroundDecorations />
      <div className="relative z-10 flex min-h-[90vh] flex-col items-center justify-center p-4 text-center">
        <main>
          <Image
            src="/logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="mx-auto"
          />
          <h1 className="font-headline animate-sheen mt-4 py-2 text-5xl font-extrabold uppercase tracking-wider text-primary md:text-7xl">
            Números da Virada
          </h1>
          <h2 className="mt-2 text-xl font-semibold text-primary/80 md:text-2xl">
            Aumente Suas Chances
          </h2>
          <p className="mt-6 max-w-lg text-lg text-slate-600">
            Este site consiste em dezenas que foram estudadas e geradas por
            especialistas.
          </p>
          <Button
            asChild
            size="sm"
            className="animate-sheen mt-8 transform rounded-lg bg-accent px-6 py-3 text-base font-bold text-accent-foreground shadow-lg transition-transform hover:scale-105 hover:bg-accent/90"
          >
            <Link href="/pricing">QUERO GERAR MINHAS DEZENAS</Link>
          </Button>
        </main>
      </div>
      <footer className="relative z-10 w-full p-4 pb-8">
        <div className="mx-auto max-w-3xl text-center text-slate-500">
          <h3 className="font-bold text-xs mb-1">Aviso Importante</h3>
          <p className="text-[10px]">
            As dezenas que você obterá em nosso sistema não são uma garantia de
            premiação. Elas são sugestões geradas com base em resoluções
            matemáticas, raciocínio lógico e um profundo estudo estatístico sobre
            todos os resultados históricos da Mega-Sena, realizado por
            especialistas. Nosso objetivo é aumentar suas probabilidades, não
            garantir o resultado. Jogue com responsabilidade.
          </p>
          <p className="mt-4 text-[10px]">
            © {new Date().getFullYear()} Números da Virada. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
