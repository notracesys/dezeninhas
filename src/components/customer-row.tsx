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
  createdAt: Timestamp; // This should be a Firestore Timestamp object
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
          setAccessCode('Não encontrado');
        }
      } catch (error) {
        console.error("Error fetching access code:", error);
        setAccessCode('Erro');
      } finally {
        setIsLoadingCode(false);
      }
    };

    fetchAccessCode();
  }, [firestore, customer.accessCodeId]);

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copiado!',
        description: 'Código de acesso copiado para a área de transferência.',
      });
    }
  };

  const getCreationDate = () => {
    // The `createdAt` field from `customer` might be a Firestore Timestamp object
    // or a plain object during the brief moment of local creation before server sync.
    // This safely handles both cases.
    if (!customer.createdAt) {
      return 'Processando...';
    }
    // Firestore Timestamps have a `toDate` method.
    if (typeof customer.createdAt.toDate === 'function') {
      return customer.createdAt.toDate().toLocaleDateString('pt-BR');
    }
    // If it's not a Timestamp object yet, it's still syncing.
    return 'Processando...';
  };

  return (
    <TableRow>
      <TableCell>{customer.email}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isLoadingCode ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : accessCode && accessCode !== 'Erro' && accessCode !== 'Não encontrado' ? (
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
            <span className="text-destructive">{accessCode || 'Erro'}</span>
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
      <TableCell>{getCreationDate()}</TableCell>
    </TableRow>
  );
}
