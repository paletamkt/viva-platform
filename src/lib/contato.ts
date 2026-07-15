/**
 * Extrai e normaliza o número de telefone do cliente a partir do texto
 * exportado do WhatsApp. Não depende de IA — usa regras fixas, então
 * o resultado é sempre o mesmo para o mesmo arquivo.
 */

// Linha típica do WhatsApp: "20/05/2026 16:03 - +55 92 8114-9585: mensagem"
const LINHA_REGEX = /^\d{2}\/\d{2}\/\d{4}\s+\d{1,2}:\d{2}\s+-\s+([^:]+):/;

// Remetente que é um número de telefone (contato não salvo na agenda)
const TELEFONE_REGEX = /^\+?55\s?\d{2}\s?\d{4,5}-?\d{4}$/;

/**
 * Normaliza um número de celular brasileiro para sempre incluir o 9º dígito.
 * Ex: "+55 92 8114-9585" e "+55 92 98114-9585" viram o mesmo resultado.
 * Retorna "" se o número não tiver 8 ou 9 dígitos após o DDD (inválido/incompleto).
 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  let rest = digits;
  if (rest.startsWith('55')) {
    rest = rest.slice(2);
  }

  const ddd = rest.slice(0, 2);
  let numero = rest.slice(2);

  // Só aceita números com 8 ou 9 dígitos (celular brasileiro válido)
  if (numero.length !== 8 && numero.length !== 9) {
    return '';
  }

  // Celular brasileiro tem 9 dígitos após o DDD; se vier com 8, adiciona o "9"
  if (numero.length === 8) {
    numero = '9' + numero;
  }

  return `55${ddd}${numero}`;
}

/**
 * Extrai o número de telefone do cliente a partir do texto da conversa.
 * Retorna o número normalizado (com 9º dígito), ou "" se não encontrar.
 */
export function extractContato(conversa: string): string {
  const linhas = conversa.split('\n');
  const contagem: Record<string, number> = {};

  for (const linha of linhas) {
    const match = linha.match(LINHA_REGEX);
    if (!match) continue;

    const remetente = match[1].trim();
    if (TELEFONE_REGEX.test(remetente)) {
      const normalizado = normalizePhone(remetente);
      if (!normalizado) continue; // ignora números inválidos (nem 8 nem 9 dígitos)
      contagem[normalizado] = (contagem[normalizado] || 0) + 1;
    }
  }

  // Pega o número que mais aparece como remetente (mais confiável que o primeiro)
  let melhor = '';
  let maiorContagem = 0;
  for (const [numero, count] of Object.entries(contagem)) {
    if (count > maiorContagem) {
      melhor = numero;
      maiorContagem = count;
    }
  }

  return melhor;
}

/**
 * Compara dois números já normalizados (ou não) e diz se são o mesmo contato.
 */
export function phonesAreSame(a: string, b: string): boolean {
  if (!a || !b) return false;
  const normA = normalizePhone(a) || a;
  const normB = normalizePhone(b) || b;
  return normA === normB;
}