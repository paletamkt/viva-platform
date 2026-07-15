/**
 * Configuração central de qual empresa está ativa nesta instância da
 * plataforma. Hoje é fixo (só a Loppifest usa o sistema), mas centralizar
 * aqui evita ter o id "loppifest" espalhado por vários arquivos — quando
 * a plataforma passar a suportar múltiplas empresas, essa função é o
 * único lugar que precisa mudar (ex: vir de uma variável de ambiente,
 * de um subdomínio, ou de uma seleção do usuário).
 */
export const EMPRESA_ATIVA_ID = 'loppifest';

export function getEmpresaAtivaId(): string {
  return EMPRESA_ATIVA_ID;
}