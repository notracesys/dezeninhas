'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export function useAdminStatus(user: User | null) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Condição 1: Se não há usuário, não é admin. Fim da verificação.
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      // Condição 2 (NOVA): Se o firestore ainda não estiver pronto, espere.
      // Não tome nenhuma decisão prematura.
      if (!firestore) {
        setIsLoading(true); // Continue no estado de carregamento.
        return;
      }

      // Se há usuário e firestore está pronto, comece a verificação.
      setIsLoading(true);
      try {
        const adminRoleRef = doc(firestore, 'roles_admin', user.uid);
        const docSnap = await getDoc(adminRoleRef);
        setIsAdmin(docSnap.exists());
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        // A verificação terminou, seja com sucesso ou erro.
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, firestore]); // A verificação agora depende do user E do firestore.

  return { isAdmin, isAdminLoading };
}
