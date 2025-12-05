'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  doc,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useAdminStatus } from '@/hooks/useAdminStatus';

interface Customer {
  id: string;
  email: string;
  accessCodeId: string;
  createdAt: any;
  accessCode?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { isAdmin, isAdminLoading } = useAdminStatus();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const customersQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isAdmin) return null;
    return query(collection(firestore, 'customers'), orderBy('createdAt', 'desc'));
  }, [firestore, user, isAdmin]);

  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Omit<Customer, 'id'>>(customersQuery);
  const [customersWithCodes, setCustomersWithCodes] = useState<Customer[]>([]);

  useEffect(() => {
    const isAuthCheckComplete = !isUserLoading && !isAdminLoading;
  
    if (isAuthCheckComplete) {
      if (!user || !isAdmin) {
        router.push('/login');
      }
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, router]);

  useEffect(() => {
    const fetchAccessCodes = async () => {
      if (customers && firestore) {
        const customersData = await Promise.all(
          customers.map(async (customer) => {
            if (!customer.accessCodeId) {
                 return {
                    ...customer,
                    accessCode: 'N/A',
                };
            }
            const codeRef = doc(firestore, 'access_codes', customer.accessCodeId);
            const codeSnap = await getDoc(codeRef);
            return {
              ...customer,
              accessCode: codeSnap.exists() ? codeSnap.data().code : 'N/A',
            };
          })
        );
        setCustomersWithCodes(customersData);
      }
    };
    fetchAccessCodes();
  }, [customers, firestore]);

  const generateAccessCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !firestore) return;

    setIsLoading(true);

    try {
      const batch = writeBatch(firestore);
      const newCode = generateAccessCode();

      // Create access code
      const accessCodeRef = doc(collection(firestore, 'access_codes'));
      batch.set(accessCodeRef, {
        code: newCode,
        isUsed: false,
        createdAt: serverTimestamp(),
      });

      // Create customer
      const customerRef = doc(collection(firestore, 'customers'));
      batch.set(customerRef, {
        email: email,
        accessCodeId: accessCodeRef.id,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      toast({
        title: 'Cliente e Código Criados!',
        description: `Código ${newCode} gerado para ${email}.`,
      });
      setEmail('');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar cliente',
        description: error.message || 'Ocorreu um problema.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código de acesso copiado para a área de transferência.',
    });
  };

  const handleLogout = async () => {
    if(!auth) return;
    await signOut(auth);
    router.push('/login');
  };

  if (isUserLoading || isAdminLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel do Administrador</h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Gerar Novo Código de Acesso</CardTitle>
            <CardDescription>
              Insira o email do cliente para gerar um novo código de acesso
              único.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCustomer} className="flex gap-4">
              <Input
                type="email"
                placeholder="email@cliente.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-grow"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Gerar Código'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes e Códigos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Código de Acesso</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingCustomers ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : customersWithCodes.length > 0 ? (
                    customersWithCodes.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{customer.accessCode}</span>
                            {customer.accessCode && customer.accessCode !== 'N/A' && (
                               <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copyToClipboard(customer.accessCode!)}
                               >
                                <Copy className="h-4 w-4" />
                               </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {customer.createdAt?.toDate ? customer.createdAt?.toDate().toLocaleDateString('pt-BR') : 'Carregando...'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center">
                        Nenhum cliente encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
