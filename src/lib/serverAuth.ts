import type { NextApiRequest } from 'next';
import { getSupabase } from '@/lib/supabase';

export interface PerfilAutenticado {
  id: string;
  email: string;
  nome: string | null;
  role: 'master' | 'suporte' | 'cliente_suporte';
  empresas: string[];
  nivel2_liberado: boolean;
}

/**
 * Verifica o token enviado pelo cliente (via authFetch) e retorna o
 * perfil correspondente. Retorna null se não houver token válido.
 */
export async function verificarAuth(req: NextApiRequest): Promise<PerfilAutenticado | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = getSupabase();

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData.user) {
    return null;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfis')
    .select('*')
    .eq('id', userData.user.id)
    .single();

  if (perfilError || !perfil) {
    return null;
  }

  return perfil as unknown as PerfilAutenticado;
}

/**
 * Dado o perfil e o header x-empresa-id (empresa que o usuário selecionou
 * na interface), retorna qual empresa deve ser usada para filtrar os dados.
 * - cliente_suporte: sempre a(s) empresa(s) do próprio perfil, ignorando o header.
 * - master/suporte: a empresa escolhida no header, se houver.
 */
export function resolverEmpresaFiltro(
  perfil: PerfilAutenticado,
  req: NextApiRequest
): string[] | null {
  if (perfil.role === 'cliente_suporte') {
    return perfil.empresas || [];
  }

  const empresaHeader = req.headers['x-empresa-id'];
  if (typeof empresaHeader === 'string' && empresaHeader) {
    return [empresaHeader];
  }

  // Master/Suporte sem empresa selecionada: sem filtro (vê tudo)
  return null;
}
