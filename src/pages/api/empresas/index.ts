import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';
import { verificarAuth } from '@/lib/serverAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const perfil = await verificarAuth(req);
  if (!perfil) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  if (req.method === 'GET') {
    try {
      const supabase = getSupabase();
      let query = supabase.from('empresas').select('*').order('nome', { ascending: true });

      // Cliente-Suporte só vê as empresas às quais tem acesso
      if (perfil.role === 'cliente_suporte') {
        if (!perfil.empresas || perfil.empresas.length === 0) {
          return res.status(200).json([]);
        }
        query = query.in('id', perfil.empresas);
      }

      const { data, error } = await query;
      if (error) throw error;

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Erro ao listar empresas:', error);
      return res.status(500).json({ erro: 'Erro ao listar empresas' });
    }
  }

  if (req.method === 'POST') {
    // Apenas Master pode criar empresas
    if (perfil.role !== 'master') {
      return res.status(403).json({ erro: 'Apenas Master pode criar empresas' });
    }

    try {
      const { id, nome, posicionamento, tom_recomendado, objecoes_mapeadas, nivel } = req.body;

      if (!id || !nome) {
        return res.status(400).json({ erro: 'ID e nome são obrigatórios' });
      }

      const supabase = getSupabase();
      const { data, error } = await (supabase.from('empresas') as any)
        .insert([{
          id,
          nome,
          posicionamento: posicionamento || null,
          tom_recomendado: tom_recomendado || null,
          objecoes_mapeadas: objecoes_mapeadas || [],
          nivel: nivel || 1,
        }])
        .select();

      if (error) throw error;

      return res.status(201).json(data?.[0] || null);
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      return res.status(500).json({ erro: 'Erro ao criar empresa' });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
