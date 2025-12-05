'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  doc,
  writeBatch,
  Timestamp,
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy, LogOut } from 'lucide-react';
import { useCollection, WithId } from '@/firebase/firestore/use-collection';

// Raw interfaces from Firestore
interface CustomerDoc {
  email: string;
  accessCodeId: string;
  createdAt: Timestamp;
}

interface AccessCodeDoc {
  code: string;
  isUsed: boolean;
  createdAt: Timestamp;
  usedAt: Timestamp | null;
}

// Combined interface for display
interface CustomerView extends WithId<CustomerDoc> {
  accessCode?: string;
  isUsed?: boolean;
}

const AUTH_KEY = 'notracesys_auth_token';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const firestore = useFirestore();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customersView, setCustomersView] = useState<CustomerView[]>([]);
  const [isViewLoading, setIsViewLoading] = useState(true);

  // Simple, robust authentication check.
  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) !== 'true') {
      router.replace('/notracesys');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const customersQuery = useMemoFirebase(() => {
    if (!firestore || !isAuthenticated) return null;
    return query(collection(firestore, 'customers'), orderBy('createdAt', 'desc'));
  }, [firestore, isAuthenticated]);

  const { data: customers, isLoading: isLoadingCustomers } = useCollection<CustomerDoc>(customersQuery);

  useEffect(() => {
    const processCustomers = async () => {
      setIsViewLoading(true);
      if (!customers || !firestore) {
        if (!isLoadingCustomers) {
           setIsViewLoading(false);
        }
        return;
      }

      const viewData = await Promise.all(
        customers.map(async (customer) => {
          let codeData: Partial<AccessCodeDoc> & { id: string } = { id: customer.accessCodeId };
          try {
            if (customer.accessCodeId) {
              const codeRef = doc(firestore, 'access_codes', customer.accessCodeId);
              const codeSnap = await getDoc(codeRef);
              if (codeSnap.exists()) {
                codeData = { ...codeSnap.data() as AccessCodeDoc, id: codeSnap.id };
              }
            }
          } catch (error) {
            console.error(`Failed to fetch access code for customer ${customer.id}`, error);
            return { 
                ...customer, 
                accessCode: 'Erro ao carregar',
                isUsed: undefined
             };
          }

          return {
            ...customer,
            accessCode: codeData?.code,
            isUsed: codeData?.isUsed,
          };
        })
      );
      
      setCustomersView(viewData);
      setIsViewLoading(false);
    };

    processCustomers();
    
  }, [customers, firestore, isLoadingCustomers]);


  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    router.push('/notracesys');
  };

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

    setIsCreatingCustomer(true);

    try {
      const batch = writeBatch(firestore);
      const newCode = generateAccessCode();
      
      const accessCodeRef = doc(collection(firestore, 'access_codes'));
      batch.set(accessCodeRef, {
        code: newCode,
        isUsed: false,
        createdAt: serverTimestamp(),
        usedAt: null,
      });

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
      console.error("Error creating customer:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar cliente',
        description: error.message || 'Ocorreu um problema.',
      });
    } finally {
      setIsCreatingCustomer(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código de acesso copiado para a área de transferência.',
    });
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Painel de Administração</h1>
          <Button variant="ghost" onClick={handleLogout}>
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
                disabled={isCreatingCustomer}
              />
              <Button type="submit" disabled={isCreatingCustomer || !email.trim()}>
                {isCreatingCustomer ? (
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
                    <TableHead>Status</TableHead>
                    <TableHead>Data de Criação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isViewLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                      </TableCell>
                    </TableRow>
                  ) : customersView.length > 0 ? (
                    customersView.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{customer.accessCode || 'Processando...'}</span>
                            {customer.accessCode && customer.accessCode !== 'Processando...' && customer.accessCode !== 'Erro ao carregar' && (
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
                          {typeof customer.isUsed === 'boolean' ? (
                              customer.isUsed ? (
                                <Badge variant="destructive">Utilizado</Badge>
                              ) : (
                                <Badge className="bg-green-600 text-white">Disponível</Badge>
                              )
                          ) : (
                            <Badge variant="secondary">{customer.accessCode === 'Erro ao carregar' ? 'Erro' : 'Processando...'}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                           {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString('pt-BR') : 'Processando...'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
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
