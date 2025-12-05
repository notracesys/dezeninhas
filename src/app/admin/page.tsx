'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/provider';
import { useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  serverTimestamp,
  query,
  orderBy,
  getDoc,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
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
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';

interface Customer {
  id: string;
  email: string;
  accessCodeId: string;
  createdAt: any;
  accessCode?: string;
}

// Custom hook to check admin status
function useAdminStatus() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const adminDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'roles_admin', user.uid);
  }, [user, firestore]);

  const { data: adminDoc, isLoading: isAdminLoading } = useDoc(adminDocRef);

  const isAdmin = adminDoc ? adminDoc.id === user?.uid : false;
  const isLoading = isUserLoading || (user && isAdminLoading);

  return { isAdmin, isLoading };
}


export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, auth } = useUser();
  const { isAdmin, isLoading: isAdminLoading } = useAdminStatus();
  const firestore = useFirestore();

  const [email, setEmail] = useState('');
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
  const [customersWithCodes, setCustomersWithCodes] = useState<Customer[]>([]);

  // Effect to handle redirection based on auth status and admin role
  useEffect(() => {
    const isCheckingPermissions = isUserLoading || isAdminLoading;
    if (isCheckingPermissions) {
      return; // Wait until all checks are complete
    }

    if (!user) {
      router.push('/login'); // Not logged in
    } else if (!isAdmin) {
       toast({
        variant: 'destructive',
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
      });
      router.push('/login'); // Logged in but not an admin
    }
  }, [user, isUserLoading, isAdmin, isAdminLoading, router, toast]);

  const customersQuery = useMemoFirebase(() => {
    // IMPORTANT: Only create the query if the user is an admin.
    if (!firestore || !isAdmin) return null; 
    return query(collection(firestore, 'customers'), orderBy('createdAt', 'desc'));
  }, [firestore, isAdmin]);

  const { data: customers, isLoading: isLoadingCustomers } = useCollection<Omit<Customer, 'id'>>(customersQuery);

  useEffect(() => {
    const fetchAccessCodes = async () => {
      if (customers && firestore) {
        const customersData = await Promise.all(
          customers.map(async (customer) => {
            if (!customer.accessCodeId) {
              return { ...customer, accessCode: 'N/A' };
            }
            try {
              const codeRef = doc(firestore, 'access_codes', customer.accessCodeId);
              const codeSnap = await getDoc(codeRef);
              return {
                ...customer,
                accessCode: codeSnap.exists() ? codeSnap.data().code : 'N/A',
              };
            } catch (error) {
              console.error(`Failed to fetch access code for customer ${customer.id}`, error);
              return { ...customer, accessCode: 'Erro' };
            }
          })
        );
        setCustomersWithCodes(customersData);
      }
    };
    
    // Only fetch codes if we are an admin and have customers
    if (isAdmin && customers) {
        fetchAccessCodes();
    }
  }, [customers, firestore, isAdmin]);

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
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
      console.error(error);
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

  // Display a loading spinner while checking auth status or admin role
  if (isUserLoading || isAdminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is definitely not an admin, they will be redirected by the effect.
  // This avoids rendering the page content for non-admins.
  if (!isAdmin) {
    return (
       <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Redirecionando...</p>
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
              />
              <Button type="submit" disabled={isCreatingCustomer}>
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
