import type { NextApiRequest, NextApiResponse } from 'next';
import { getClientesPorContato } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const data = await getClientesPorContato();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return res.status(500).json({
      erro: 'Erro ao buscar clientes',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}