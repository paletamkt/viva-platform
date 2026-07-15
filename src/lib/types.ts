export interface AnalisePilar {
  nome: string;
  score: number;
  descricao: string;
}

export interface AnaliseSentimento {
  score: number;
  geral: 'muito_positivo' | 'positivo' | 'neutro' | 'negativo' | 'muito_negativo';
  justificativa: string;
}

export interface AnaliseJson {
  contato: string;
  cliente_nome: string;
  data_conversa_inicio: string;
  data_ultima_mensagem: string;
  sentimento: AnaliseSentimento;
  pilares: AnalisePilar[];
  resumo: string;
  problemas: string[];
  oportunidades: string[];
  acoes_recomendadas: string[];
}

export interface Analise {
  id: string;
  contato: string;
  cliente_nome: string;
  data_conversa_inicio: string;
  data_ultima_mensagem: string;
  data_upload: string;
  conversa_original: string;
  analise_json: AnaliseJson;
  sentimento_score: number;
  sentimento_geral: string;
  versao_prompt: string;
  status: 'confirmado' | 'pendente';
  criado_por: string;
  criado_em: string;
  cliente_id: string;
}

export interface Cliente {
  contato: string;
  cliente_nome: string;
  quantidade_conversas: number;
  sentimento_medio: number;
  ultima_conversa: string;
}
