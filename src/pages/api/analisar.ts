import type { NextApiRequest, NextApiResponse } from 'next';
import { analisarConversa } from '@/lib/claude';
import { getSupabase } from '@/lib/supabase';
import { extractContato } from '@/lib/contato';
import { AnaliseJson } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { conversa } = req.body;

    if (!conversa || conversa.length < 50) {
      return res.status(400).json({
        erro: 'Conversa muito curta (mínimo 50 caracteres)',
      });
    }

    const supabase = getSupabase();

    // 1. Chamar Claude API (análise + extração de nome/datas)
    console.log('Analisando conversa com Claude...');
    const analiseJson = await analisarConversa(conversa);

    if (!analiseJson) {
      return res.status(500).json({
        erro: 'Erro ao processar análise',
      });
    }

    // 2. Extrair contato via regex (determinístico, não depende da IA)
    //    Fallback: usa o que o Claude sugeriu, e por último "semcontato"
    const contato = extractContato(conversa) || analiseJson.contato || 'semcontato';

    // 3. Gerar ID da análise (baseado no contato normalizado)
    const dataParte = new Date().toISOString().substring(0, 10).replace(/-/g, '');
    const analiseId = `evt_loppifest_${dataParte}_${contato}`;

    // 4. Checar se essa mesma análise já existe (evita duplicata por reenvio)
    const { data: existente } = await supabase
      .from('analises')
      .select('id, cliente_nome, criado_em')
      .eq('id', analiseId)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({
        erro: 'Essa conversa já foi analisada anteriormente.',
        analise_id: (existente as any).id,
        cliente_nome: (existente as any).cliente_nome,
        criado_em: (existente as any).criado_em,
      });
    }

    // 5. Salvar arquivo .txt no Storage
    const nomeArquivo = `${analiseId}.txt`;
    const { error: uploadError } = await supabase.storage
      .from('conversas')
      .upload(nomeArquivo, conversa, {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error('Erro ao salvar arquivo:', uploadError);
      // Continuar mesmo se falhar (não é crítico)
    }

    // 6. Salvar análise no banco
    const docAnalise = {
      id: analiseId,
      contato,
      cliente_nome: analiseJson.cliente_nome || '',
      data_conversa_inicio: analiseJson.data_conversa_inicio,
      data_ultima_mensagem: analiseJson.data_ultima_mensagem,
      data_upload: new Date().toISOString(),
      conversa_original: conversa,
      analise_json: analiseJson,
      sentimento_score: analiseJson.sentimento.score,
      sentimento_geral: analiseJson.sentimento.geral,
      versao_prompt: '2.0.0',
      status: 'confirmado',
      criado_por: 'api',
      criado_em: new Date().toISOString(),
      cliente_id: 'loppifest',
    };

    const { data, error } = await supabase
      .from('analises')
      .insert([docAnalise] as any)
      .select();

    if (error) {
      console.error('Erro ao salvar no banco:', error);
      return res.status(500).json({
        erro: 'Erro ao salvar análise',
      });
    }

    return res.status(201).json({
      sucesso: true,
      analise_id: analiseId,
      contato,
      cliente_nome: analiseJson.cliente_nome,
      sentimento: analiseJson.sentimento,
    });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}