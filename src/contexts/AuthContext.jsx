import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);

async function loadProfile(userId) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (!profile) return null;
  const { data: { user: authUser } } = await supabase.auth.getUser();
  return {
    id:       profile.id,
    email:    authUser?.email ?? '',
    fullName: profile.full_name,
    phone:    profile.phone ?? null,
    role:     profile.role,
    avatar:   profile.avatar_url ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) setUser(await loadProfile(session.user.id));
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN'  && session?.user) setUser(await loadProfile(session.user.id));
        if (event === 'SIGNED_OUT')                  setUser(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  }, []);

  const register = useCallback(async ({ fullName, email, phone, password }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw error;
    if (authData.user && phone) {
      await supabase.from('profiles').update({ phone }).eq('id', authData.user.id);
    }
    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
