import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_KEY:', supabaseKey ? supabaseKey.slice(0, 20) + '...' : 'VAZIO');

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getAnalises() {
  const { data, error } = await supabase
    .from('analises')
    .select('*')
    .order('data_upload', { ascending: false });

  if (error) {
    console.error('Erro ao buscar análises:', error);
    return [];
  }

  return data || [];
}

export async function getAnalisePorId(id: string) {
  const { data, error } = await supabase
    .from('analises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Erro ao buscar análise:', error);
    return null;
  }

  return data;
}

export async function getClientesPorContato() {
  const { data, error } = await supabase
    .from('analises')
    .select('contato, cliente_nome, data_upload, sentimento_score')
    .order('data_upload', { ascending: false });

  if (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }

  // Agrupar por contato
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
}

export async function getAnalisasPorContato(contato: string) {
  const { data, error } = await supabase
    .from('analises')
    .select('*')
    .eq('contato', contato)
    .order('data_conversa_inicio', { ascending: false });

  if (error) {
    console.error('Erro ao buscar análises por contato:', error);
    return [];
  }

  return data || [];
}
