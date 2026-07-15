import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';
import { verificarAuth, resolverEmpresaFiltro } from '@/lib/serverAuth';

const CAMPOS_LISTA = 'id, contato, cliente_nome, data_conversa_inicio, data_ultima_mensagem, data_upload, analise_json, sentimento_score, sentimento_geral, status, criado_por, criado_em, cliente_id';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const perfil = await verificarAuth(req);
  if (!perfil) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const supabase = getSupabase();
    const empresasFiltro = resolverEmpresaFiltro(perfil, req);

    let query = supabase.from('analises').select(CAMPOS_LISTA).order('data_upload', { ascending: false });

    if (empresasFiltro !== null) {
      if (empresasFiltro.length === 0) {
        return res.status(200).json([]);
      }
      query = query.in('cliente_id', empresasFiltro);
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json(data || []);
  } catch (error) {
    console.error('getAnalises error:', error);
    return res.status(500).json({ erro: 'Erro ao buscar análises' });
  }
}
