// withAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithAuth(props: P) {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
      // Wait a moment for the auth hook to initialize from localStorage
      const timer = setTimeout(() => {
        if (!authLoading) {
          if (!isAuthenticated) {
            router.push('/auth/login');
          } else {
            setIsInitialized(true);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }, [router, isAuthenticated, authLoading]);

    if (authLoading || !isInitialized) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
