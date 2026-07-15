import type { NextApiRequest, NextApiResponse } from 'next';
import { analisarConversa } from '@/lib/claude';
import { getSupabase, getEmpresa } from '@/lib/supabase';
import { extractContato } from '@/lib/contato';
import { hashConversa } from '@/lib/hash';
import { normalizeAnalise } from '@/lib/normalizeAnalise';
import { getEmpresaAtivaId } from '@/lib/empresa';
import { verificarAuth } from '@/lib/serverAuth';
import { AnaliseJson } from '@/lib/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const perfil = await verificarAuth(req);
  if (!perfil) {
    return res.status(401).json({ erro: 'Não autenticado' });
  }

  try {
    const { conversa } = req.body;

    if (!conversa || conversa.length < 50) {
      return res.status(400).json({
        erro: 'Conversa muito curta (mínimo 50 caracteres)',
      });
    }

    const supabase = getSupabase();

    // Determinar a empresa: cliente_suporte usa a própria; master/suporte usa
    // a selecionada no header (x-empresa-id), com fallback para a padrão.
    let empresaId = getEmpresaAtivaId();
    if (perfil.role === 'cliente_suporte') {
      empresaId = perfil.empresas?.[0] || empresaId;
    } else {
      const empresaHeader = req.headers['x-empresa-id'];
      if (typeof empresaHeader === 'string' && empresaHeader) {
        empresaId = empresaHeader;
      }
    }

    // 0. Buscar contexto da empresa (posicionamento, tom, objeções)
    const contextoEmpresa = await getEmpresa(empresaId);

    // 1. Chamar Claude API (análise + extração de nome/datas), já com contexto
    console.log('Analisando conversa com Claude...');
    const analiseJsonRaw = await analisarConversa(conversa, contextoEmpresa as any);

    if (!analiseJsonRaw) {
      return res.status(500).json({
        erro: 'Erro ao processar análise',
      });
    }

    // 1.1 Normalizar o JSON (corrige variações de nome de campo da IA)
    const analiseJson = normalizeAnalise(analiseJsonRaw);

    // 2. Extrair contato via regex (determinístico, não depende da IA)
    const contato = extractContato(conversa) || analiseJson.contato || 'semcontato';

    // 3. Gerar ID da análise (empresa + data + contato + hash do conteúdo)
    const dataParte = new Date().toISOString().substring(0, 10).replace(/-/g, '');
    const hash = hashConversa(conversa);
    const analiseId = `evt_${empresaId}_${dataParte}_${contato}_${hash}`;

    // 4. Checar se essa mesma análise já existe (evita duplicata por reenvio idêntico)
    const { data: existente } = await supabase
      .from('analises')
      .select('id, cliente_nome, criado_em')
      .eq('id', analiseId)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({
        erro: 'Essa conversa já foi analisada anteriormente (conteúdo idêntico).',
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
    }

    // 6. Salvar análise no banco (incluindo snapshot do contexto usado)
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
      contexto_snapshot: contextoEmpresa,
      status: 'confirmado',
      criado_por: perfil.email,
      criado_em: new Date().toISOString(),
      cliente_id: empresaId,
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
