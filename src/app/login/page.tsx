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
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

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
      await signInWithEmailAndPassword(auth, email, password);
      // On successful login, explicitly navigate to the admin page.
      router.push('/admin');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Falha no Login',
        description: 'Email ou senha incorretos. Por favor, tente novamente.',
      });
      setIsSubmitting(false);
    }
  };

  // Show a global loader only during the initial auth state check.
  if (isUserLoading) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is already logged in, show a message and a link instead of the form.
  // This prevents the redirect loop.
  if (user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
        <Card className="w-full max-w-sm text-center">
            <CardHeader>
                <CardTitle>Você já está logado</CardTitle>
                <CardDescription>Clique no botão abaixo para acessar o painel.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/admin">Ir para o Painel de Admin</Link>
                </Button>
            </CardContent>
        </Card>
      </main>
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
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
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
