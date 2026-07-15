import { createClient } from '@supabase/supabase-js';

// Cliente Supabase seguro para uso no navegador (login, sessão).
// Diferente de src/lib/supabase.ts, que é bloqueado para uso client-side.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseClient = createClient(url, key);
