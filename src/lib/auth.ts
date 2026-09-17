import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  if (!supabase) return { preview: true } as const;
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { preview: false } as const;
}

export async function signUp(email: string, password: string) {
  if (!supabase) return { preview: true } as const;
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { preview: false } as const;
}
