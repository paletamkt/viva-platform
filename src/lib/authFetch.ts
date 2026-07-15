import { supabaseClient } from '@/lib/supabaseClient';

/**
 * Wrapper de fetch que anexa o token de login do usuário em cada chamada
 * para as rotas de API, permitindo que o servidor saiba quem está pedindo
 * os dados (necessário para aplicar as permissões por papel/empresa).
 *
 * Por padrão, também anexa a empresa selecionada (se houver) no header
 * x-empresa-id. Passe { semFiltroEmpresa: true } para ignorar isso —
 * usado na tela de Configurações, que precisa ver dados de todas as
 * empresas independente do filtro ativo na tela principal.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
  extra: { semFiltroEmpresa?: boolean } = {}
): Promise<Response> {
  const { data: { session } } = await supabaseClient.auth.getSession();

  const headers = new Headers(options.headers);
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  if (!extra.semFiltroEmpresa) {
    const empresaSelecionada = typeof window !== 'undefined'
      ? localStorage.getItem('viva_empresa_selecionada')
      : null;
    if (empresaSelecionada) {
      headers.set('x-empresa-id', empresaSelecionada);
    }
  }

  return fetch(url, { ...options, headers });
}
