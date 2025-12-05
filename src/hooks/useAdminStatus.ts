'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';

export function useAdminStatus(user: User | null) {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);

  useEffect(() => {
    // Com a nova regra, qualquer usuário logado é um administrador.
    if (user) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    // A verificação é instantânea, então o carregamento termina logo.
    setIsAdminLoading(false);
  }, [user]);

  return { isAdmin, isAdminLoading };
}
