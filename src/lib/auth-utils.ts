import { cache } from 'react';
import { auth } from './auth';
import { authClient } from './auth-client';

// Server-side session verification with caching
export const verifySession = cache(async (headers: Headers) => {
  try {
    const session = await auth.api.getSession({ headers });
    return session;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
});

export const createSessionHook = () => {
  let sessionCache: unknown = null;
  let lastFetch = 0;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  const getSession = async () => {
    const now = Date.now();
    
    if (sessionCache && (now - lastFetch) < CACHE_DURATION) {
      console.log('Session hook - Returning cached session:', sessionCache);
      return sessionCache;
    }

    try {
      console.log('Session hook - Fetching new session...');
      const session = await authClient.getSession();
      console.log('Session hook - Raw session response:', session);
      console.log('Session hook - Session type:', typeof session);
      console.log('Session hook - Session keys:', session ? Object.keys(session) : 'null');
      
      if (session?.data) {
        console.log('Session hook - Using session.data');
        sessionCache = session.data;
        lastFetch = now;
        return session.data;
      } else if (session && typeof session === 'object') {
        console.log('Session hook - Using session directly');
        sessionCache = session;
        lastFetch = now;
        return session;
      }
      console.log('Session hook - No valid session found');
      return null;
    } catch (error) {
      console.error('Session hook - Session fetch error:', error);
      return null;
    }
  };

  const clearCache = () => {
    sessionCache = null;
    lastFetch = 0;
  };

  const refreshSession = async () => {
    clearCache();
    return await getSession();
  };

  return { getSession, clearCache, refreshSession };
};
