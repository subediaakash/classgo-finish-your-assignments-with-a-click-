"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { authClient } from '@/lib/auth-client';
import { createSessionHook } from '@/lib/auth-utils';

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface Session {
  user: User;
  expires: string;
}

interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const sessionHook = useRef(createSessionHook());
  const mounted = useRef(false);

  const refreshSession = useCallback(async () => {
    try {
      setError(null);
      const sessionData = await sessionHook.current.getSession();
      if (sessionData && typeof sessionData === 'object' && 'user' in sessionData && 'expires' in sessionData) {
        setSession(sessionData as Session);
        setUser((sessionData as Session).user);
      } else if (sessionData && typeof sessionData === 'object' && 'user' in sessionData) {
        setSession({ user: sessionData.user, expires: new Date().toISOString() } as Session);
        setUser(sessionData.user as User);
      } else if (sessionData && typeof sessionData === 'object' && 'id' in sessionData) {
        setUser(sessionData as User);
        setSession({ user: sessionData as User, expires: new Date().toISOString() } as Session);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
      setError('Failed to refresh session');
      setSession(null);
      setUser(null);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const signIn = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await authClient.signIn.social({ provider: 'google' });
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setError(null);
      await authClient.signOut();
      sessionHook.current.clearCache();
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refreshSession();
    
    return () => {
      mounted.current = false;
    };
  }, [refreshSession]);

  useEffect(() => {
    const handleAuthChange = () => {
      refreshSession();
    };

    window.addEventListener('storage', handleAuthChange);
    
    const handleFocus = () => {
      refreshSession();
    };
    
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshSession]);

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    refreshSession,
  };
}

