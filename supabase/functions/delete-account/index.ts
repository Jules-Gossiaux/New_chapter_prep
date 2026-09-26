import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }
  if (request.method !== 'POST') {
    return json({ code: 'METHOD_NOT_ALLOWED' }, 405);
  }

  try {
    const authHeader = request.headers.get('Authorization');
    const url = Deno.env.get('SUPABASE_URL');
    const publishableKey =
      Deno.env.get('SUPABASE_ANON_KEY') ??
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!authHeader || !url || !publishableKey || !serviceRoleKey) {
      return json({ code: 'SERVICE_NOT_CONFIGURED' }, 503);
    }

    const authClient = createClient(url, publishableKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser();
    if (userError || !user?.email) {
      return json(
        { code: 'AUTH_REQUIRED', message: 'Please sign in again.' },
        401,
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body.password === 'string' ? body.password : '';
    if (!password) {
      return json(
        {
          code: 'PASSWORD_REQUIRED',
          message: 'Enter your password to continue.',
        },
        400,
      );
    }

    const verificationClient = createClient(url, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: passwordError } =
      await verificationClient.auth.signInWithPassword({
        email: user.email,
        password,
      });
    if (passwordError) {
      return json(
        { code: 'INVALID_PASSWORD', message: 'The password is incorrect.' },
        401,
      );
    }

    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: ownedBooks, error: booksError } = await admin
      .from('books')
      .select('cover_path')
      .eq('user_id', user.id);
    if (booksError) throw booksError;
    const coverPaths = (ownedBooks ?? [])
      .map((book) => book.cover_path)
      .filter((path): path is string => typeof path === 'string' && !!path);
    if (coverPaths.length) {
      const { error: coversError } = await admin.storage
        .from('book-covers')
        .remove(coverPaths);
      if (coversError) throw coversError;
    }
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;
    return json({ deleted: true });
  } catch {
    return json(
      {
        code: 'ACCOUNT_DELETE_FAILED',
        message: 'The account could not be deleted.',
      },
      500,
    );
  }
});
