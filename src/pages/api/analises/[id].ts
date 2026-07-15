import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  if (req.method === 'DELETE') {
    try {
      const supabase = getSupabase();

      const { error } = await supabase
        .from('analises')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir análise:', error);
        return res.status(500).json({ erro: 'Erro ao excluir análise' });
      }

      // Tenta remover o arquivo do Storage também (não crítico se falhar)
      await supabase.storage.from('conversas').remove([`${id}.txt`]);

      return res.status(200).json({ sucesso: true });
    } catch (error) {
      console.error('Erro na API:', error);
      return res.status(500).json({
        erro: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  return res.status(405).json({ erro: 'Método não permitido' });
}