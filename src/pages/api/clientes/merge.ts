import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { contatoOrigem, contatoDestino, cliente_nome } = req.body;

    if (
      typeof contatoOrigem !== 'string' ||
      typeof contatoDestino !== 'string' ||
      !contatoOrigem ||
      !contatoDestino
    ) {
      return res.status(400).json({ erro: 'Contatos inválidos' });
    }

    if (contatoOrigem === contatoDestino) {
      return res.status(400).json({ erro: 'Não é possível mesclar um contato com ele mesmo' });
    }

    const supabase = getSupabase();

    // Move todas as análises do contato de origem para o contato de destino
    const updatePayload: any = { contato: contatoDestino };
    if (typeof cliente_nome === 'string' && cliente_nome.trim()) {
      updatePayload.cliente_nome = cliente_nome.trim();
    }

    const { error } = await (supabase.from('analises') as any)
      .update(updatePayload)
      .eq('contato', contatoOrigem);

    if (error) {
      console.error('Erro ao mesclar clientes:', error);
      return res.status(500).json({ erro: 'Erro ao mesclar clientes' });
    }

    // Se um nome foi definido, aplica também nas análises que já eram do destino
    if (typeof cliente_nome === 'string' && cliente_nome.trim()) {
      await (supabase.from('analises') as any)
        .update({ cliente_nome: cliente_nome.trim() })
        .eq('contato', contatoDestino);
    }

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}