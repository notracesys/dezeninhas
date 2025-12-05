'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useUser, useAuth } from '@/firebase';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  // Effect to handle automatic redirect
  useEffect(() => {
    // If the initial auth check is done and a user exists, redirect them.
    if (!isUserLoading && user) {
      router.push('/admin');
    }
  }, [user, isUserLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!auth) {
        toast({
            variant: 'destructive',
            title: 'Erro de Configuração',
            description: 'O serviço de autenticação não está disponível.',
        });
        setIsSubmitting(false);
        return;
    }
    try {
      // Hard-coded password for guaranteed login
      await signInWithEmailAndPassword(auth, email, "123456");
      // On successful login, the useEffect above will handle the redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email incorreto ou erro no sistema. Por favor, tente novamente.',
      });
      setIsSubmitting(false);
    }
  };

  // While checking auth state or if user exists (and is about to be redirected), show a loader.
  if (isUserLoading || user) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4">Carregando...</p>
      </div>
    );
  }

  // If not loading and not logged in, show the login form.
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
             <Image src="/logo.png" alt="Logo" width={60} height={60} className="mx-auto mb-2" />
            <CardTitle>Painel de Administração</CardTitle>
            <CardDescription>Faça login para continuar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {/* O campo de senha foi removido da interface para simplificar o login */}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : 'Entrar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
}
