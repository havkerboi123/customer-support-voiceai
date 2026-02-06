'use client';

import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  email: string | null;
  submitEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  // Check for existing email on mount
  useEffect(() => {
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setEmail(storedEmail);
      setIsAuthenticated(true);
    }
  }, []);

  const submitEmail = async (emailValue: string) => {
    try {
      // Try to store email in Supabase if configured
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('users')
          .insert([
            {
              email: emailValue,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) {
          // If user already exists, that's okay - just continue
          if (error.code !== '23505') {
            console.warn('Supabase error (continuing with localStorage):', error);
          }
        }
      }
    } catch {
      // Supabase not configured or error - continue with localStorage
      console.log('Using localStorage for email storage');
    }

    // Always store in localStorage as fallback
    localStorage.setItem('user_email', emailValue);
    setEmail(emailValue);
    setIsAuthenticated(true);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, submitEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
