/**
 * Normaliza o JSON retornado pelo Claude antes de salvar no banco.
 * A IA às vezes varia o nome de alguns campos (ex: "cinco_pilares" em vez
 * de "pilares", "classificacao" em vez de "geral"). Esta função garante
 * que o formato salvo seja sempre consistente, independente da variação.
 */
export function normalizeAnalise(raw: any): any {
  const pilares = raw.pilares || raw.cinco_pilares || [];

  const sentimentoRaw = raw.sentimento || {};
  const sentimento = {
    score: typeof sentimentoRaw.score === 'number' ? sentimentoRaw.score : 0,
    geral: sentimentoRaw.geral || sentimentoRaw.classificacao || 'neutro',
    justificativa: sentimentoRaw.justificativa || '',
  };

  return {
    ...raw,
    pilares,
    sentimento,
    problemas: raw.problemas || [],
    oportunidades: raw.oportunidades || [],
    acoes_recomendadas: raw.acoes_recomendadas || [],
    resumo: raw.resumo || '',
  };
}
