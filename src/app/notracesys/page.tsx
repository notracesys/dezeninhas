'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { verifySecretCode } from './actions';

const AUTH_KEY = 'notracesys_auth_token';

export default function SecretCodeLoginPage() {
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if the user is already authenticated on the client side.
    if (sessionStorage.getItem(AUTH_KEY) === 'true') {
      router.replace('/admin');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isCorrect = await verifySecretCode(code);

    if (isCorrect) {
      // On successful validation, set a session token and redirect.
      sessionStorage.setItem(AUTH_KEY, 'true');
      toast({
        title: 'Acesso Autorizado!',
        description: 'Redirecionando para o painel de administração...',
      });
      router.push('/admin');
    } else {
      toast({
        variant: 'destructive',
        title: 'Código Incorreto',
        description: 'O código secreto inserido está incorreto. Tente novamente.',
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Verificando sessão...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <Image src="/logo.png" alt="Logo" width={60} height={60} className="mx-auto mb-2" />
            <CardTitle>Painel de Administração</CardTitle>
            <CardDescription>Insira o código secreto para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secret-code">Código Secreto</Label>
              <Input
                id="secret-code"
                type="password"
                placeholder="Seu código secreto"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting || !code}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
