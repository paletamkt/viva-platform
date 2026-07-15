import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function initializeSupabase() {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase client should only be used on the server');
  }

  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.warn('Supabase credentials missing - will fail at runtime');
      return null;
    }

    try {
      supabaseClient = createClient(url, key);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      return null;
    }
  }

  return supabaseClient;
}

export function getSupabase() {
  const client = initializeSupabase();
  if (!client) {
    throw new Error('Supabase not initialized - check your environment variables');
  }
  return client;
}

export async function getAnalises() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('analises')
      .select('*')
      .order('data_upload', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getAnalises error:', error);
    return [];
  }
}

export async function getAnalisePorId(id: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('analises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getAnalisePorId error:', error);
    return null;
  }
}

export async function getClientesPorContato() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('analises')
      .select('*')
      .order('data_upload', { ascending: false });

    if (error) throw error;

    const clientesMap = new Map();
    (data || []).forEach((analise: any) => {
      const key = analise.contato || 'sem_contato';
      if (!clientesMap.has(key)) {
        clientesMap.set(key, {
          contato: analise.contato,
          cliente_nome: analise.cliente_nome || `Cliente ${clientesMap.size + 1}`,
          conversas: [],
        });
      }
      clientesMap.get(key).conversas.push(analise);
    });

    return Array.from(clientesMap.values());
  } catch (error) {
    console.error('getClientesPorContato error:', error);
    return [];
  }
}

export async function getAnalisasPorContato(contato: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('analises')
      .select('*')
      .eq('contato', contato)
      .order('data_conversa_inicio', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getAnalisasPorContato error:', error);
    return [];
  }
}

export async function getEmpresa(empresaId: string) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresaId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getEmpresa error:', error);
    return null;
  }
}
