"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpenIcon } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/sign-in',
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpenIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Authentication Required
          </h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to access this page.
          </p>
          <Button onClick={signIn} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

