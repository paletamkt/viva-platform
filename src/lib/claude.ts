import { AnaliseJson } from './types';

const PROMPT_VIVA_2_0 = `# PROMPT VIVA 2.0 — Extração + Análise de Conversas de Vendas

Você é um analista especialista em conversas de vendas para eventos. Sua tarefa é extrair dados estruturados e analisar a conversa.

## EXTRAÇÃO OBRIGATÓRIA

### 1. CONTATO (Número WhatsApp)
- Busque: +55 92 XXXXX-XXXX ou variações
- Processe: remova símbolos → "5592982410613"
- Se não encontrar: deixe vazio ("")

### 2. DATA CONVERSA INÍCIO
- Procure: primeira linha com timestamp
- Formate: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
- Se não encontrar: use data atual

### 3. DATA ÚLTIMA MENSAGEM
- Procure: última linha com timestamp
- Formate: ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)

### 4. CLIENTE NOME (Extração Inteligente)
- Prioridade 1: Nome de pessoa ("Eu sou João" → "João")
- Prioridade 2: Evento/Local ("Aniversário 50 anos")
- Prioridade 3: Deixe vazio ("") — NUNCA "Cliente 01"

## ANÁLISE

### SENTIMENTO (score 0-100, geral, justificativa)
- 0-20: muito_negativo
- 21-50: negativo
- 51-75: neutro
- 76-90: positivo
- 91-100: muito_positivo

### 5 PILARES (nome, score, descricao cada)
1. Compreensão do Diferencial
2. Clareza de Quantidade & Cardápio
3. Logística & Localização
4. Negociação de Valor
5. Qualidade do Atendimento

### RESUMO (< 150 caracteres)
### PROBLEMAS (array 1-5 itens)
### OPORTUNIDADES (array 1-5 itens)
### AÇÕES RECOMENDADAS (array 1-5 itens)

## REGRAS CRÍTICAS
1. Retorne APENAS JSON válido, sem markdown
2. Scores: números inteiros 0-100
3. Datas: ISO 8601 com Z final
4. cliente_nome: NUNCA "Cliente 01"
5. Arrays: mínimo 1, máximo 5 itens
6. Use EXATAMENTE os nomes de campo especificados acima (ex: "pilares", não "cinco_pilares"; "geral" dentro de "sentimento", não "classificacao")

Retorne APENAS JSON, nada mais!`;

interface ContextoEmpresa {
  nome?: string;
  posicionamento?: string;
  tom_recomendado?: string;
  objecoes_mapeadas?: any;
}

function montarBlocoContexto(contexto?: ContextoEmpresa | null): string {
  if (!contexto) return '';

  const partes: string[] = [];
  if (contexto.nome) partes.push(`Empresa: ${contexto.nome}`);
  if (contexto.posicionamento) partes.push(`Posicionamento: ${contexto.posicionamento}`);
  if (contexto.tom_recomendado) partes.push(`Tom de atendimento esperado: ${contexto.tom_recomendado}`);
  if (contexto.objecoes_mapeadas && Array.isArray(contexto.objecoes_mapeadas) && contexto.objecoes_mapeadas.length > 0) {
    partes.push(`Objeções comuns mapeadas: ${JSON.stringify(contexto.objecoes_mapeadas)}`);
  }

  if (partes.length === 0) return '';

  return `\n## CONTEXTO DA EMPRESA\nUse este contexto para avaliar com mais precisão se o atendimento seguiu o posicionamento e tom esperados da empresa.\n${partes.join('\n')}\n`;
}

export async function analisarConversa(
  conversa: string,
  contextoEmpresa?: ContextoEmpresa | null
): Promise<AnaliseJson | null> {
  try {
    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      throw new Error('CLAUDE_API_KEY não configurada');
    }

    const blocoContexto = montarBlocoContexto(contextoEmpresa);

    const prompt = `${PROMPT_VIVA_2_0}
${blocoContexto}
## CONVERSA A ANALISAR
${conversa}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.content || !data.content[0]) {
      throw new Error('Resposta inválida da Claude API');
    }

    const responseText = data.content[0].text;

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Não foi possível extrair JSON da resposta');
    }

    const analise = JSON.parse(jsonMatch[0]) as AnaliseJson;

    return analise;
  } catch (error) {
    console.error('Erro ao analisar conversa:', error);
    throw error;
  }
}
