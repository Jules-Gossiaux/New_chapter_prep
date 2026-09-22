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
  return {
    preview: false,
    user: data.user,
    session: data.session,
    existingAccount: Boolean(data.user && data.user.identities?.length === 0),
  } as const;
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

export async function deleteAccount(password: string) {
  if (!supabase) return { preview: true } as const;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) throw new Error('AUTH_REQUIRED');
  const { error } = await supabase.functions.invoke('delete-account', {
    body: { password },
  });
  if (error) {
    const response =
      'context' in error && error.context instanceof Response
        ? error.context
        : null;
    if (response) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      if (payload?.message) throw new Error(payload.message);
    }
    throw error;
  }
  return { preview: false } as const;
}
