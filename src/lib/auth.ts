import { supabase } from './supabase';

export async function signIn(email: string, password: string) {
  if (!supabase) return { preview: true } as const;
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return { preview: false, user: data.user, session: data.session } as const;
}

export async function signUp(email: string, password: string) {
  if (!supabase) return { preview: true } as const;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { preview: false, user: data.user, session: data.session } as const;
}

export async function getCurrentUser() {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
