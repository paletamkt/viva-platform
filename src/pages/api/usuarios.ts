import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';
import { verificarAuth } from '@/lib/serverAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const perfil = await verificarAuth(req);
  if (!perfil || perfil.role !== 'master') {
    return res.status(403).json({ erro: 'Apenas Master pode ver usuários' });
  }

  if (req.method === 'GET') {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('email', { ascending: true });

      if (error) throw error;

      return res.status(200).json(data || []);
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({ erro: 'Erro ao listar usuários' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { userId, empresas, role, nivel2_liberado } = req.body;

      if (!userId) {
        return res.status(400).json({ erro: 'userId é obrigatório' });
      }

      const supabase = getSupabase();
      const payload: any = {};
      if (Array.isArray(empresas)) payload.empresas = empresas;
      if (typeof role === 'string') payload.role = role;
      if (typeof nivel2_liberado === 'boolean') payload.nivel2_liberado = nivel2_liberado;

      const { error } = await (supabase.from('perfis') as any)
        .update(payload)
        .eq('id', userId);

      if (error) throw error;

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao editar usuário:', error);
      return res.status(500).json({ erro: 'Erro ao editar usuário' });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
