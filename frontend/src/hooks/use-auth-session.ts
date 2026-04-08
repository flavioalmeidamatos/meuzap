import { useEffect, useState } from 'react';
import { type Session, type User } from '@supabase/supabase-js';
import { getSupabaseClient, hasSupabaseConfig } from '../lib/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export function useAuthSession() {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setStatus('unauthenticated');
      setSession(null);
      setUser(null);
      return;
    }

    const supabase = getSupabaseClient();

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      const nextSession = data.session;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    };

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setStatus(nextSession ? 'authenticated' : 'unauthenticated');
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { status, session, user };
}
