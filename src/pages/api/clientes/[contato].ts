import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { contato } = req.query;

  if (typeof contato !== 'string') {
    return res.status(400).json({ erro: 'Contato inválido' });
  }

  if (req.method === 'PATCH') {
    try {
      const { cliente_nome } = req.body;

      if (typeof cliente_nome !== 'string' || !cliente_nome.trim()) {
        return res.status(400).json({ erro: 'Nome inválido' });
      }

      const supabase = getSupabase();

      const { error } = await supabase
        .from('analises')
        .update({ cliente_nome: cliente_nome.trim() } as any)
        .eq('contato', contato);

      if (error) {
        console.error('Erro ao atualizar nome do cliente:', error);
        return res.status(500).json({ erro: 'Erro ao atualizar nome do cliente' });
      }

      return res.status(200).json({ sucesso: true, cliente_nome: cliente_nome.trim() });
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