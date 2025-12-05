'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User } from 'firebase/auth';

export function useAdminStatus(user: User | null) {
  const firestore = useFirestore();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAdminLoading, setIsAdminLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsAdmin(false); // Reset on user change
    
    if (!user) {
      setIsAdminLoading(false);
      return;
    }

    setIsAdminLoading(true);
    const checkAdminStatus = async () => {
      try {
        if (firestore) {
          const adminRef = doc(firestore, 'roles_admin', user.uid);
          const adminDoc = await getDoc(adminRef);
          
          if (adminDoc.exists() && adminDoc.data()?.isAdmin === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, firestore]);

  return { isAdmin, isAdminLoading };
}
