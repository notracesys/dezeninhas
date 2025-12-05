
'use client';

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Copy } from 'lucide-react';
import { WithId } from '@/firebase/firestore/use-collection';

// Raw interfaces from Firestore
export interface CustomerDoc {
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

interface CustomerRowProps {
  customer: WithId<CustomerDoc>;
}

export function CustomerRow({ customer }: CustomerRowProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [isUsed, setIsUsed] = useState<boolean | null>(null);
  const [isLoadingCode, setIsLoadingCode] = useState(true);

  useEffect(() => {
    const fetchAccessCode = async () => {
      if (!firestore || !customer.accessCodeId) {
        setIsLoadingCode(false);
        return;
      }
      try {
        const codeRef = doc(firestore, 'access_codes', customer.accessCodeId);
        const codeSnap = await getDoc(codeRef);
        if (codeSnap.exists()) {
          const codeData = codeSnap.data() as AccessCodeDoc;
          setAccessCode(codeData.code);
          setIsUsed(codeData.isUsed);
        } else {
          console.error(`Access code not found for ID: ${customer.accessCodeId}`);
        }
      } catch (error) {
        console.error("Error fetching access code:", error);
      } finally {
        setIsLoadingCode(false);
      }
    };

    fetchAccessCode();
  }, [firestore, customer.accessCodeId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado!',
      description: 'Código de acesso copiado para a área de transferência.',
    });
  };

  return (
    <TableRow>
      <TableCell>{customer.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isLoadingCode ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : accessCode ? (
            <>
              <span>{accessCode}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(accessCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <span className="text-destructive">Erro</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        {isLoadingCode ? (
           <Badge variant="secondary">...</Badge>
        ) : typeof isUsed === 'boolean' ? (
          isUsed ? (
            <Badge variant="destructive">Utilizado</Badge>
          ) : (
            <Badge className="bg-green-600 text-white">Disponível</Badge>
          )
        ) : (
           <Badge variant="secondary">Erro</Badge>
        )}
      </TableCell>
      <TableCell>
        {customer.createdAt?.toDate ? customer.createdAt.toDate().toLocaleDateString('pt-BR') : 'Processando...'}
      </TableCell>
    </TableRow>
  );
}
