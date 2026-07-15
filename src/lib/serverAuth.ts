import type { NextApiRequest } from 'next';
import { createClient } from '@supabase/supabase-js';

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
 * perfil correspondente. Cria um client Supabase "autenticado" com o
 * token do usuário para que as políticas de RLS (ex: na tabela perfis)
 * reconheçam corretamente quem está fazendo a consulta.
 */
export async function verificarAuth(req: NextApiRequest): Promise<PerfilAutenticado | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabaseAutenticado = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabaseAutenticado.auth.getUser(token);
  if (userError || !userData.user) {
    return null;
  }

  const { data: perfil, error: perfilError } = await supabaseAutenticado
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

  return null;
}
