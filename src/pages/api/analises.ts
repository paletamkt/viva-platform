import type { NextApiRequest, NextApiResponse } from 'next';
import { getAnalises } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const data = await getAnalises();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar análises:', error);
    return res.status(500).json({
      erro: 'Erro ao buscar análises',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}