import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';
import { verificarAuth } from '@/lib/serverAuth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  if (req.method === 'PATCH') {
    const perfil = await verificarAuth(req);
    if (!perfil || perfil.role !== 'master') {
      return res.status(403).json({ erro: 'Apenas Master pode editar empresas' });
    }

    try {
      const { nivel, nome, posicionamento, tom_recomendado } = req.body;
      const supabase = getSupabase();

      const payload: any = {};
      if (typeof nivel === 'number') payload.nivel = nivel;
      if (typeof nome === 'string') payload.nome = nome;
      if (typeof posicionamento === 'string') payload.posicionamento = posicionamento;
      if (typeof tom_recomendado === 'string') payload.tom_recomendado = tom_recomendado;

      const { error } = await (supabase.from('empresas') as any)
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      console.error('Erro ao editar empresa:', error);
      return res.status(500).json({ erro: 'Erro ao editar empresa' });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}
